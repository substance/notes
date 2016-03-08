"use strict";

var fs = require('fs');
var path = require('path');
var each = require('lodash/each');
var async = require('async');

var EventEmitter = require('substance/util/EventEmitter');
var JSONConverter = require('substance/model/JSONConverter');
var _ = require('substance/util/helpers');
var knexConfig = require('../knexfile');


// Please integrate here directly

// var Knex = require('knex');
// var environment = process.env.NODE_ENV || 'development';

// var connect = function(knexConfig) {
//   var config = knexConfig[environment];
//   if (!config) {
//     throw new Error('Could not find config for environment', environment);
//   }
//   return new Knex(config);
// };

// module.exports = connect;




/*
  Implements the Substance DocumentStore API.
*/
function DocumentStore(config) {
  this.config = config;
  
  this.connect();
  DocumentStore.super.apply(this);
}

DocumentStore.Prototype = function() {

  /*
    Connect to the db
  */
  this.connect = function() {
    this.db = connect(knexConfig);
  };

  /*
    Disconnect from the db and shut down
  */
  this.shutdown = function(cb) {
    this.db.destroy(cb);
  };

  // Changes API
  // -----------

  /*
    Add a change to a document

    @param {Object} args arguments
    @param {String} args.documentId document id
    @param {Object} args.change JSON object
    @param {String} args.userId user id
    @param {Function} cb callback
  */
  this.addChange = function(args, cb) {
    var self = this;
    
    this._documentExists(args.documentId, function(err) {
      if (err) return cb(err);
      self.getVersion(args.documentId, function(err, headVersion) {
        if (err) return cb(err);
        var version = headVersion + 1;
        var record = {
          id: args.documentId + '/' + version,
          document: args.documentId,
          pos: version,
          data: JSON.stringify(args.change),
          timestamp: Date.now(),
          userId: args.userId
        };

        self.db.table('changes').insert(record)
          .asCallback(function(err) {
            if (err) return cb(err);
            var req = {
              documentId: args.documentId,
              version: version
            };
            self.requestSnapshotCreation(req, function(err) {
              if (err) return cb(err);
              cb(null, version);
            });
          });
      });
    });
  };

  /*
    Get changes from the DB

    @param {Object} args arguments
    @param {String} args.documentId document id
    @param {String} args.sinceVersion changes since version (0 = all changes, 1 all except first change)
    @param {Function} cb callback
  */
  this.getChanges = function(args, cb) {
    var self = this;

    this._documentExists(args.documentId, function(err) {
      if(err) return cb(err);
      
      var query = self.db('changes')
                  .select('data', 'id')
                  .where('document', args.documentId)
                  .andWhere('pos', '>=', args.sinceVersion)
                  .orderBy('pos', 'asc');

      query.asCallback(function(err, changes) {
        if (err) return cb(err);
        changes = _.map(changes, function(c) {return JSON.parse(c.data); });
        self.getVersion(args.documentId, function(err, headVersion) {
          if (err) return cb(err);
          var res = {
            currentVersion: headVersion,
            changes: changes
          };
          return cb(null, res);
        });
      });
    });
  };

  /*
    Remove all changes of a document

    @param {String} id document id
    @param {Function} cb callback
  */
  this.removeChanges = function(id, cb) {
    var query = this.db('changes')
                .where('document', id)
                .del();

    query.asCallback(function(err) {
      return cb(err);
    });
  };

  // Documents API
  // -------------

  /*
    Creates a new empty or prefilled document
  
    Writes the initial change into the database.
    Returns the JSON serialized version, as a starting point

    @param {Object} args arguments
    @param {String} args.documentId document id
    @param {String} args.schemaName document schema name
    @param {String} args.userId user id
    @param {Function} cb callback
  */
  this.createDocument = function(args, cb) {
    var self = this;

    var schemaConfig = this.config.schemas[args.schemaName];
    if (!schemaConfig) {
      cb(new Error('Schema '+ args.schemaName +' not found'));
    }
    var docFactory = schemaConfig.documentFactory;
    var doc = docFactory.createArticle();

    this._createDocument(args.documentId, schemaConfig, args.userId, function(err, docData){
      if(err) return cb(err);
      var changeset = docFactory.createChangeset();
      var req = {
        documentId: docData.documentId,
        change: changeset[0],
        userId: docData.userId
      };
      self.addChange(req, function(err, version) {
        if(err) return cb(err);
        var res = {
          data: doc,
          version: version
        };
        cb(null, res);
      });
    });
  };

  /*
    List available documents

    @param {Object} filters filters
    @param {Function} cb callback
  */
  this.listDocuments = function(filters, cb) {
    var query = this.db('documents')
                .where(filters);

    query.asCallback(cb);
  };

  /*
    Get document snapshot

    Uses schema information stored at the doc entry and
    constructs a document using the corresponding documentFactory
    that is available as a schema config object.

    @param {String} id document id
    @param {Function} cb callback
  */
  this.getDocument = function(id, cb) {
    var self = this;

    this._getDocument(id, function(err, docData){
      if(err) return cb(err);

      var schemaConfig = self.config.schemas[docData.schemaName];
      
      if (!schemaConfig) {
        cb(new Error('Schema ' + docData.schemaName + ' not found'));
      }

      var req = {
        documentId: id,
        sinceVersion: docData.version
      };
      self.getChanges(req, function(err, res) {
        if(err) return cb(err);
        
        var docFactory = schemaConfig.documentFactory;
        var doc = new docFactory.ArticleClass();
        var converter = new JSONConverter();
        var jsonSnapshot = JSON.parse(docData.snapshot);
        doc = converter.importDocument(doc, jsonSnapshot);
        
        if(res.changes.length > 1) {
          _.each(res.changes, function(change) {
            _.each(change.ops, function(op){
              doc.data.apply(op);
            });
          });
        }
        
        
        var output = {
          data: converter.exportDocument(doc),
          version: res.currentVersion,
          userId: docData.userId
        };
        cb(null, output);
      });
    });
  };

  /*
    Get the version number for a document

    @param {String} id document id
    @param {Function} cb callback
  */
  this.getVersion = function(id, cb) {
    // HINT: version = count of changes
    // 0 changes: version = 0
    // 1 change:  version = 1
    var query = this.db('changes')
                .where('document', id)
                .count();

    query.asCallback(function(err, count) {
      if (err) return cb(err);
      var result = count[0]['count(*)'];
      return cb(null, result);
    });
  };

  /*
    Request creation of new snapshot

    Will create new snapshot only during document
    creation or in case if version is divisible
    by frequency constant

    @param {Object} args arguments
    @param {String} args.documentId document id
    @param {String} args.version document version from change
    @param {Function} cb callback
  */
  this.requestSnapshotCreation = function(args, cb) {
    var frequency = this.config.snapshotFrequency;
    if(args.version % frequency !== 0 && args.version !== 1) return cb(null);
    this._createSnapshot(args.documentId, args.version, cb);
  };

  /*
    Remove a document from the db

    Removes a document and all changes
    belonged to this document

    @param {String} id document id
    @param {Function} cb callback
  */
  this.deleteDocument = function(id, cb) {
    var self = this;

    var query = this.db('documents')
                .where('documentId', id)
                .del();
    query.asCallback(function(err) {
      if(err) return cb(err);
      self.removeChanges(id, function(err) {
        cb(err);
      });
    });
  };

  // Documents API helpers
  // ---------------------

  /*
    Internal method to create a document
  */
  this._createDocument = function(id, schemaConfig, userId, cb) {
    var doc = {
      documentId: id,
      schemaName: schemaConfig.name,
      schemaVersion: schemaConfig.version,
      userId: userId
    };

    this.db.table('documents').insert(doc)
      .asCallback(function(err) {
        if (err) return cb(err);
        cb(null, doc);
      });
  };

  /*
    Internal method to get a document
  */
  this._getDocument = function(id, cb) {
    var query = this.db('documents')
                .where('documentId', id);

    query.asCallback(function(err, doc) {
      if (err) return cb(err);
      doc = doc[0];
      if (!doc) return cb(new Error('No document found for documentId ' + id));
      cb(null, doc);
    });
  };

  /*
    Check if document exists
  */
  this._documentExists = function(id, cb) {
    var query = this.db('documents')
                .where('documentId', id)
                .limit(1);
    query.asCallback(function(err, doc) {
      if (err) return cb(err);
      if(doc.length === 0) return cb(new Error('Document does not exist'));
      cb(null);
    });
  };

  /*
    Create snapshot for a given document
  */
  this._createSnapshot = function(id, version, cb) {
    var self = this;

    this._getDocument(id, function(err, docData) {
      if(err) return cb(err);

      var schemaConfig = self.config.schemas[docData.schemaName];
      
      if (!schemaConfig) {
        cb(new Error('Schema ' + docData.schemaName + ' not found'));
      }

      var req = {
        documentId: id,
        sinceVersion: docData.version || 0
      };

      self.getChanges(req, function(err, res) {
        if(err) return cb(err);
        
        var doc;
        var converter = new JSONConverter();
        var docFactory = schemaConfig.documentFactory;

        if(docData.version > 0) {
          var jsonSnapshot = JSON.parse(docData.snapshot);
          doc = new docFactory.ArticleClass();
          doc = converter.importDocument(doc, jsonSnapshot);
        } else {
          doc = docFactory.createEmptyArticle();
        }

        _.each(res.changes, function(change) {
          _.each(change.ops, function(op){
            // doc here should be already restored
            doc.data.apply(op);
          });
        });
        
        // doc here should be already restored
        var snapshot = converter.exportDocument(doc);
        self._updateSnapshot(id, snapshot, version, cb);
      });
    });
  };

  /*
    Update document record with new snapshot and version number
  */
  this._updateSnapshot = function(id, snapshot, version, cb) {
    var query = this.db('documents')
                .where('documentId', id)
                .update({
                  snapshot: JSON.stringify(snapshot),
                  version: version
                });

    query.asCallback(cb);
  };

  // Seed API
  // --------

  /*
    Remove sqlite file for current environment

    @param {Function} cb callback
  */
  this.cleanDb = function(cb) {
    var self = this;

    // Close db connection
    this.shutdown(function() {
      var env = process.env.NODE_ENV || 'development';
      var filePath = path.resolve(knexConfig[env].connection.filename);
      fs.stat(filePath, function(err, stats) {
        // Remove db file if it is exists
        if(stats) fs.unlink(filePath);
        // Establish new connection with db
        self.connect();
        cb(null);
      });
    });
  };

  /*
    Run migrations

    @param {Function} cb callback
  */
  this.runMigration = function(cb) {
    this.db.migrate.latest({directory: './db/migrations'}).asCallback(function(err){
      if(err) return cb(err);
      cb(null);
    });
  };

  /*
    Resets the database and loads a given seed object

    Be careful with running this in production

    @param {Object} seed JSON object
    @param {Function} cb callback
  */
  this.seed = function(seed, cb) {
    var self = this;
    
    var documents = {};

    function wipe(callback) {
      self.cleanDb.call(self, callback);
    }

    function migrate(callback) {
      self.runMigration.call(self, callback);
    }

    function seedUsers(callback) {
      async.eachSeries(seed.users, function(user, callback) {
        self.createUser(user, callback);
      }, callback);
    }

    function seedSessions(callback) {
      async.eachSeries(seed.sessions, function(session, callback) {
        self._createSession(session, callback);
      }, callback);
    }

    function seedDocuments(callback) {
      async.eachSeries(documents, function(data, callback) {
        var req = {
          documentId: data.id,
          schemaName: data.schemaName,
          userId: data.userId
        };
        self.createDocument(req, callback);
      }, callback);
    }

    function prepareSeed(callback) {
      each(seed.documents, function(document, id) {
        var result = {
          schemaName: document.schema.name,
          id: id,
          userId: document.userId
        };
        documents[id] = result;
      });
      callback(null);
    }

    async.series([
      wipe,
      migrate,
      prepareSeed,
      seedUsers,
      seedSessions,
      seedDocuments
      ], function(err) {
      if (err) return cb(err);
      cb(null);
    });
  };
};

EventEmitter.extend(DocumentStore);

module.exports = DocumentStore;