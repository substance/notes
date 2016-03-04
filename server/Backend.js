"use strict";

var fs = require('fs');
var path = require('path');
var each = require('lodash/each');
var async = require('async');
var connect = require('./connect');
var localFiles = require('./localFiles');
var EventEmitter = require('substance/util/EventEmitter');
var JSONConverter = require('substance/model/JSONConverter');
var _ = require('substance/util/helpers');
var uuid = require('substance/util/uuid');
var knexConfig = require('../knexfile');


/*
  Implements example of Substance Backend API.
*/
function Backend(config) {
  this.config = config;
  this.storage = localFiles;
  this.connect();
  Backend.super.apply(this);
}

Backend.Prototype = function() {

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
            cb(null, version);
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
        sinceVersion: 0
      };

      self.getChanges(req, function(err, res) {
        if(err) return cb(err);
        
        var docFactory = schemaConfig.documentFactory;
        var doc = docFactory.createEmptyArticle();
        
        _.each(res.changes, function(change) {
          _.each(change.ops, function(op){
            doc.data.apply(op);
          });
        });
        
        var converter = new JSONConverter();
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

  // Users API
  // ---------

  /*
    Create a new user record (aka signup)

    @param {Object} userData JSON object
    @param {Function} cb callback
  */
  this.createUser = function(userData, cb) {
    var self = this;
    
    this._userExists(userData.userId, function(err, exists) {
      if(err) return cb(err);
      if(exists) return cb(new Error('User already exists'));
      self._createUser(userData, cb);
    });
  };

  /*
    Get user record for a given userId

    @param {String} userId user id
    @param {Function} cb callback
  */
  this.getUser = function(userId, cb) {
    var query = this.db('users')
                .where('userId', userId);

    query.asCallback(function(err, user) {
      if (err) return cb(err);
      if (user.length === 0) return cb(new Error('No user found for userId ' + userId));
      user = user[0];
      user.userId = user.userId.toString();
      cb(null, user);
    });
  };

  // Users API helpers
  // -----------------

  /*
    Internal method to create a user entry
  */
  this._createUser = function(userData, cb) {
    // at some point we should make this more secure
    var loginKey = userData.loginKey || uuid();
    var user = {
      name: userData.name,
      email: userData.email,
      createdAt: Date.now(),
      loginKey: loginKey
    };

    this.db.table('users').insert(user)
      .asCallback(function(err, userIds) {
        if (err) return cb(err);
        user.userId = userIds[0];
        //console.log(user.userId, userData.userId);
        cb(null, user);
      });
  };

  /*
    Check if user exists
  */
  this._userExists = function(id, cb) {
    var query = this.db('users')
                .where('userId', id)
                .limit(1);
    query.asCallback(function(err, user) {
      if (err) return cb(err);
      if(user.length === 0) return cb(null, false);
      cb(null, true);
    });
  };

  /*
    Get user record for a given loginKey
  */
  this._getUserByLoginKey = function(loginKey, cb) {
    var query = this.db('users')
                .where('loginKey', loginKey);

    query.asCallback(function(err, user) {
      if (err) return cb(err);
      user = user[0]; // query result is an array
      if (!user) return cb(new Error('Your provided login key was invalid.'));
      cb(null, user);
    });
  };

  // Session API
  // -----------

  /*
    Create a session record for a given user

    @param {String} userId user id
    @param {Function} cb callback
  */
  this.createSession = function(userId, cb) {
    var newSession = {
      sessionToken: uuid(),
      timestamp: Date.now(),
      userId: userId
    };

    this._createSession(newSession, cb);
  };

  /*
    Get session entry based on a session token

    @param {String} sessionToken session token
    @param {Function} cb callback
  */
  this.getSession = function(sessionToken, cb) {
    var self = this;

    this._getSession(sessionToken, function(err, session) {
      if (err) return cb(err);
      self._getRichSession(session, cb);
    });
  };

  /*
    Remove session entry based with a given session token

    @param {String} sessionToken session token
    @param {Function} cb callback
  */
  this.deleteSession = function(sessionToken, cb) {
    var self = this;

    this._sessionExists(sessionToken, function(err) {
      if (err) return cb(err);
      var query = self.db('sessions')
            .where('sessionToken', sessionToken)
            .del();

      query.asCallback(cb);
    });
  };

  /*
    Checks given login data and creates an entry in the session store for valid logins
    Returns a an object with a user record and a session token

    @param {Object} loginData JSON object
    @param {Function} cb callback
  */
  this.authenticate = function(loginData, cb) {
    if (loginData.sessionToken) {
      this._authenticateWithToken(loginData.sessionToken, cb);
    } else {
      this._authenticateWithLoginKey(loginData.loginKey, cb);
    }
  };

  // Session API helpers
  // -------------------

  /*
    Internal method to create a session record
  */
  this._createSession = function(session, cb) {
    this.db.table('sessions').insert(session)
      .asCallback(function(err) {
        if (err) return cb(err);
        cb(null, session);
      });
  };

  /*
    Refreshes session for an authenticated user

    Returns a rich session including a user object
  */
  this._createSessionFromOldSession = function(oldSession, cb) {
    var self = this;
    this.deleteSession(oldSession.sessionToken, function(err) {
      if (err) return cb(err);
      self.createSession(oldSession.userId, function(err, session) {
        if (err) return cb(err);
        self._getRichSession(session, cb);
      });
    });
  };

  /*
    Internal method to get a session record
  */
  this._getSession = function(sessionToken, cb) {
    var query = this.db('sessions')
                .where('sessionToken', sessionToken);

    query.asCallback(function(err, session) {
      if (err) return cb(err);
      session = session[0];
      if (!session) return cb(new Error('No session found for that token'));
      cb(null, session);
    });
  };

  /*
    Just turns the session db record into an expanded version that contains
    the complete user record.
  */
  this._getRichSession = function(session, cb) {
    this.getUser(session.userId, function(err, user) {
      if (err) return cb(err);
      session.user = user;
      cb(null, session);
    });
  };

  /*
    Check if session exists
  */
  this._sessionExists = function(sessionToken, cb) {
    var query = this.db('sessions')
                .where('sessionToken', sessionToken)
                .limit(1);
    
    query.asCallback(function(err, session) {
      if (err) return cb(err);
      if(session.length === 0) return cb(new Error('Session does not exist'));
      cb(null);
    });
  };

  /*
    Creates a new user session based on an existing sessionToken
  */
  this._authenticateWithToken = function(sessionToken, cb) {
    var self = this;
    this._getSession(sessionToken, function(err, session) {
      if (err) return cb(new Error('No session found for '+sessionToken));
      // Delete existing session and create a new one
      self._createSessionFromOldSession(session, cb);
    });
  };

  /*
    Authenicate based on login key
  */
  this._authenticateWithLoginKey = function(loginKey, cb) {
    var self = this;
    this._getUserByLoginKey(loginKey, function(err, user) {
      if (err) return cb(err);
      self.createSession(user.userId, function(err, session) {
        if (err) return cb(err);
        session.user = user;
        cb(null, session);
      });
    });
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

  // Storage helpers
  // ---------------

  /*
    Returns middleware for file uploading
  */
  this.getFileUploader = function(fieldname) {
    return this.storage.uploader.single(fieldname);
  };

  /*
    Get name of stored file
  */
  this.getFileName = function(req) {
    return req.file.filename;
  };

};

EventEmitter.extend(Backend);

module.exports = Backend;