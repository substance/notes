"use strict";

var oo = require('substance/util/oo');
var _ = require('substance/util/helpers');
var Err = require('substance/util/Error');
var uuid = require('substance/util/uuid');

/*
  Implements the Substance DocumentStore API.
*/
function DocumentStore(config) {
  this.config = config;
  this.db = config.db.connection;
}

DocumentStore.Prototype = function() {

  /*
    Remove a document record from the db

    @param {String} documentId document id
    @param {Function} cb callback
  */
  this.deleteDocument = function(documentId, cb) {
    var query = this.db('documents')
                .where('documentId', documentId)
                .del();
    
    this.getDocument(documentId, function(err, doc) {
      if (err) {
        return cb(new Err('DocumentStore.DeleteError', {
          cause: err
        }));
      }

      query.asCallback(function(err) {
        if (err) {
          return cb(new Err('DocumentStore.DeleteError', {
            cause: err
          }));          
        }
        cb(null, doc);
      });
    });
  };

  // Documents API helpers
  // ---------------------

  /*
    Internal method to create a document record
  */
  this.createDocument = function(props, cb) {

    if (!props.documentId) {
      // We generate a documentId ourselves
      props.documentId = uuid();
    }

    var self = this;
    if(props.info) {
      if(props.info.title) props.title = props.info.title;
      if(props.info.userId) {
        props.userId = props.info.userId;
        props.updatedBy = props.info.userId;
      }
      if(props.info.updatedAt) props.updatedAt = props.info.updatedAt;
      props.info = JSON.stringify(props.info);
    }
    this.db.table('documents').insert(props)
      .asCallback(function(err) {
        if (err) {
          return cb(new Err('DocumentStore.CreateError', {
            cause: err
          }));
        }
        self.getDocument(props.documentId, cb);
      });
  };

  /*
    Promise version
  */
  this._createDocument = function(props) {
    if(props.info) {
      if(props.info.title) props.title = props.info.title;
      if(props.info.userId) props.userId = props.info.userId;
      if(props.info.updatedAt) props.updatedAt = props.info.updatedAt;
      // Let's keep updatedBy here for seeding
      if(props.info.updatedBy) {
        props.updatedBy = props.info.updatedBy;
      } else if (props.info.userId){
        props.updatedBy = props.info.userId;
      }
      props.info = JSON.stringify(props.info);
    }
    return this.db.table('documents').insert(props);
  };

  this.documentExists = function(documentId, cb) {
    var query = this.db('documents')
            .where('documentId', documentId)
            .limit(1);

    query.asCallback(function(err, doc) {
      if (err) {
        return cb(new Err('DocumentStore.ReadError', {
          cause: err,
          info: 'Happened within documentExists.'
        }));
      }
      cb(null, doc.length > 0);
    });
  };

  /*
    Internal method to get a document
  */
  this.getDocument = function(documentId, cb) {
    var query = this.db('documents')
                .where('documentId', documentId);

    query.asCallback(function(err, doc) {
      if (err) {
        return cb(new Err('DocumentStore.ReadError', {
          cause: err
        }));
      }
      doc = doc[0];
      if (!doc) {
        return cb(new Err('DocumentStore.ReadError', {
          message: 'No document found for documentId ' + documentId,
        }));
      }
      if(doc.info) {
        doc.info = JSON.parse(doc.info);
      }
      cb(null, doc);
    });
  };

  /*
    Update a document record
  */
  this.updateDocument = function(documentId, props, cb) {
    var self = this;
    if(props.info) {
      if(props.info.userId) props.userId = props.info.userId;
      if(props.info.updatedAt) props.updatedAt = props.info.updatedAt;
      if(props.info.updatedBy) props.updatedBy = props.info.updatedBy;
      props.info = JSON.stringify(props.info);
    }
    this.documentExists(documentId, function(err, exists) {
      if (err) {
        return cb(new Err('DocumentStore.UpdateError', {
          cause: err
        }));
      }
      if (!exists) {
        return cb(new Err('DocumentStore.UpdateError', {
          message: 'Document ' + documentId + ' does not exists'
        }));
      }
      self.db.table('documents').where('documentId', documentId).update(props)
        .asCallback(function(err) {
          if (err) {
            return cb(new Err('DocumentStore.UpdateError', {
              cause: err
            }));
          }
          self.getDocument(documentId, cb);
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
    Resets the database and loads a given seed object

    Be careful with running this in production

    @param {Object} seed JSON object
    @param {Function} cb callback
  */

  this.seed = function(seed) {
    var self = this;
    var actions = _.map(seed, self._createDocument.bind(self));

    return Promise.all(actions);
  };
};

oo.initClass(DocumentStore);

module.exports = DocumentStore;