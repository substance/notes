"use strict";

var oo = require('substance/util/oo');
var Err = require('substance/util/SubstanceError');
var uuid = require('substance/util/uuid');
var each = require('lodash/each');
var map = require('lodash/map');
var isUndefined = require('lodash/isUndefined');
var Promise = require('bluebird');

/*
  Implements the Substance DocumentStore API.
*/
function DocumentStore(config) {
  this.config = config;
  this.db = config.db.connection;
}

DocumentStore.Prototype = function() {

  // Documents API helpers
  // ---------------------

  /*
    Internal method to create a document record
  */
  this.createDocument = function(props, cb) {
    if (!props.documentId) {
      // We generate a documentId ourselves
      props.document_id = uuid();
    } else {
      props.document_id = props.documentId;
    }
    delete props.documentId;

    if(props.schemaName) {
      props.schema_name = props.schemaName;
      delete props.schemaName;
    }

    if(props.schemaVersion) {
      props.schema_version = props.schemaVersion;
      delete props.schemaVersion;
    }

    if(props.info) {
      if(props.info.title) props.title = props.info.title;
      if(props.info.userId) {
        props.user_id = props.info.userId;
        props.updated_by = props.info.userId;
      }
      if(props.info.updatedAt) props.updated = props.info.updatedAt;
    }
    
    this.documentExists(props.document_id, function(err, exists) {
      if (err) {
        return cb(new Err('DocumentStore.CreateError', {
          cause: err
        }));
      }

      if (exists) {
        return cb(new Err('DocumentStore.CreateError', {
          message: 'Document ' + props.document_id + ' already exists.'
        }));
      }

      this.db.documents.insert(props, function(err, doc) {
        if (err) {
          return cb(new Err('DocumentStore.CreateError', {
            cause: err
          }));
        }

        // Set documentId explictly as it will be used by Document Engine
        doc.documentId = doc.document_id;
        // Set schemaName and schemaVersion explictly as it will be used by Snapshot Engine
        doc.schemaName = doc.schema_name;
        doc.schemaVersion = doc.schema_version;
        doc.userId = doc.user_id;

        cb(null, doc);
      });
    }.bind(this));
  };

  /*
    Promise version
  */
  this._createDocument = function(props) {
    return new Promise(function(resolve, reject) {
      this.createDocument(props, function(err, doc) {
        if(err) {
          return reject(err);
        }

        resolve(doc);
      });
    }.bind(this));
  };

  /*
    Check if document exists
    @param {String} documentId document id
    @param {Callback} cb callback
    @returns {Callback}
  */
  this.documentExists = function(documentId, cb) {
    this.db.documents.findOne({document_id: documentId}, function(err, doc) {
      if (err) {
        return cb(new Err('DocumentStore.ReadError', {
          cause: err,
          info: 'Happened within documentExists.'
        }));
      }

      cb(null, !isUndefined(doc));
    });
  };

  /*
    Get document record for a given documentId
    
    @param {String} documentId document id
    @param {Callback} cb callback
    @returns {Callback}
  */
  this.getDocument = function(documentId, cb) {
    this.db.documents.findOne({document_id: documentId}, function(err, doc) {
      if (err) {
        return cb(new Err('DocumentStore.ReadError', {
          cause: err
        }));
      }

      if (!doc) {
        return cb(new Err('DocumentStore.ReadError', {
          message: 'No document found for documentId ' + documentId
        }));
      }

      // Set documentId explictly as it will be used by Document Engine
      doc.documentId = doc.document_id;
      // Set schemaName and schemaVersion explictly as it will be used by Snapshot Engine
      doc.schemaName = doc.schema_name;
      doc.schemaVersion = doc.schema_version;
      doc.userId = doc.user_id;

      cb(null, doc);
    });
  };

  /*
    Update a document record with given props
    
    @param {String} documentId document id
    @param {Object} props properties to update
    @param {Callback} cb callback
    @returns {Callback}
  */
  this.updateDocument = function(documentId, props, cb) {
    if(props.info) {
      if(props.info.title) props.title = props.info.title;
      if(props.info.userId) props.user_id = props.info.userId;
      if(props.info.updatedAt) props.updated = props.info.updatedAt;
      if(props.info.updatedBy) props.updated_by = props.info.updatedBy;
    }

    if(props.schemaName) {
      props.schema_name = props.schemaName;
      delete props.schemaName;
    }

    if(props.schemaVersion) {
      props.schema_version = props.schemaVersion;
      delete props.schemaVersion;
    }
    
    this.documentExists(documentId, function(err, exists) {
      if (err) {
        return cb(new Err('DocumentStore.UpdateError', {
          cause: err
        }));
      }

      if (!exists) {
        return cb(new Err('DocumentStore.UpdateError', {
          message: 'Document with documentId ' + documentId + ' does not exists'
        }));
      }

      var documentData = props;
      documentData.document_id = documentId;

      this.db.documents.save(documentData, function(err, doc) {
        if (err) {
          return cb(new Err('DocumentStore.UpdateError', {
            cause: err
          }));
        }

        // Set documentId explictly as it will be used by Document Engine
        doc.documentId = doc.document_id;
        // Set schemaName and schemaVersion explictly as it will be used by Snapshot Engine
        doc.schemaName = doc.schema_name;
        doc.schemaVersion = doc.schema_version;
        doc.userId = doc.user_id;

        cb(null, doc);
      });
    }.bind(this));
  };

  /*
    Remove a document record from the db

    @param {String} documentId document id
    @param {Callback} cb callback
    @returns {Callback}
  */
  this.deleteDocument = function(documentId, cb) {
    this.documentExists(documentId, function(err, exists) {
      if (err) {
        return cb(new Err('DocumentStore.DeleteError', {
          cause: err
        }));
      }

      if (!exists) {
        return cb(new Err('DocumentStore.DeleteError', {
          message: 'Document with documentId ' + documentId + ' does not exists'
        }));
      }

      this.db.documents.destroy({document_id: documentId}, function(err, doc) {
        if (err) {
          return cb(new Err('DocumentStore.DeleteError', {
            cause: err
          }));
        }
        doc = doc[0];
        
        // Set documentId explictly as it will be used by Document Engine
        doc.documentId = doc.document_id;
        // Set schemaName and schemaVersion explictly as it will be used by Snapshot Engine
        doc.schemaName = doc.schema_name;
        doc.schemaVersion = doc.schema_version;
        doc.userId = doc.user_id;

        cb(null, doc);
      });
    }.bind(this));
  };

  /*
    List available documents

    @param {Object} filters filters
    @param {Object} options options (limit, offset, columns)
    @param {Callback} cb callback
    @returns {Callback}
  */
  this.listDocuments = function(filters, options, cb) {
    // set default to avoid unlimited listing
    options.limit = options.limit || 1000;
    options.offset = options.offset || 0;

    if(filters.userId) {
      filters.user_id = filters.userId;
      delete filters.userId;
    }

    this.db.documents.find(filters, options, function(err, docs) {
      if (err) {
        return cb(new Err('DocumentStore.ListError', {
          cause: err
        }));
      }

      each(docs, function(doc) {
        // Set documentId explictly as it will be used by Document Engine
        doc.documentId = doc.document_id;
        // Set schemaName and schemaVersion explictly as it will be used by Snapshot Engine
        doc.schemaName = doc.schema_name;
        doc.schemaVersion = doc.schema_version;
        doc.userId = doc.user_id;
      });

      cb(null, docs);
    });
  };

  /*
    Count available documents

    @param {Object} filters filters
    @param {Function} cb callback
    @returns {Callback}
  */
  this.countDocuments = function(filters, cb) {
    this.db.documents.count(filters, function(err, count) {
      if (err) {
        return cb(new Err('UserStore.CountError', {
          cause: err
        }));
      }

      cb(null, count);
    });
  };

  /*
    Loads a given seed object to database

    Be careful with running this in production

    @param {Object} seed JSON object
    @param {Function} cb callback
  */

  this.seed = function(seed) {
    var self = this;
    var actions = map(seed, self._createDocument.bind(self));

    return Promise.all(actions);
  };
};

oo.initClass(DocumentStore);

module.exports = DocumentStore;