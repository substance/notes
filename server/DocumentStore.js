"use strict";

var oo = require('substance/util/oo');
var _ = require('substance/util/helpers');

/*
  Implements the Substance DocumentStore API.
*/
function DocumentStore(config) {
  this.config = config;
  this.db = config.db.connection;
}

DocumentStore.Prototype = function() {

  /*
    Remove a document from the db

    Removes a document and all changes
    belonged to this document

    @param {String} id document id
    @param {Function} cb callback
  */
  this.deleteDocument = function(id, cb) {
    var query = this.db('documents')
                .where('documentId', id)
                .del();
    
    this.documentExists(id, function(err) {
      if(err) return cb(err);
      query.asCallback(cb);
    });
  };

  // Documents API helpers
  // ---------------------

  /*
    Internal method to create a document record
  */
  this.createDocument = function(props, cb) {
    var self = this;
    if(props.info) {
      if(props.info.userId) props.userId = props.info.userId;
      props.info = JSON.stringify(props.info);
    }
    this.db.table('documents').insert(props)
      .asCallback(function(err) {
        if (err) return cb(err);
        self.getDocument(props.documentId, cb);
      });
  };

  /*
    Promise version
  */
  this._createDocument = function(props) {
    if(props.info) {
      if(props.info.userId) props.userId = props.info.userId;
      props.info = JSON.stringify(props.info);
    }
    return this.db.table('documents').insert(props);
  };

  this.documentExists = function(documentId, cb) {
    var query = this.db('documents')
            .where('documentId', documentId)
            .limit(1);

    query.asCallback(function(err, doc) {
      if (err) return cb(err);
      if(doc.length === 0) return cb(new Error('Document does not exist'));
      cb(null);
    });
  };

  /*
    Internal method to get a document
  */
  this.getDocument = function(documentId, cb) {
    var query = this.db('documents')
                .where('documentId', documentId);

    query.asCallback(function(err, doc) {
      if (err) return cb(err);
      doc = doc[0];
      if (!doc) return cb(new Error('No document found for documentId ' + documentId));
      if(doc.info) {
        doc.info = JSON.parse(doc.info);
      }
      cb(null, doc);
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