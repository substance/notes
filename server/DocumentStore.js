"use strict";

var oo = require('substance/util/oo');

/*
  Implements the Substance DocumentStore API.
*/
function DocumentStore(config) {
  this.config = config;
  this.db = config.db.connection;

  DocumentStore.super.apply(this);
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
    Internal method to create a document record
  */
  this.createDocument = function(props, cb) {
    this.db.table('documents').insert(props)
      .asCallback(function(err) {
        if (err) return cb(err);
        // TODO: return inserted document record
        cb(null);
      });
  };

  this.documentExists = function(documentId, cb) {
    this._documentExists(documentId, cb);
  };

  /*
    Internal method to get a document
  */
  this._getDocument = function(documentId, cb) {
    var query = this.db('documents')
                .where('documentId', documentId);

    query.asCallback(function(err, doc) {
      if (err) return cb(err);
      doc = doc[0];
      if (!doc) return cb(new Error('No document found for documentId ' + documentId));
      cb(null, doc);
    });
  };

  /*
    Check if document exists
  */
  this._documentExists = function(documentId, cb) {
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
    Resets the database and loads a given seed object

    Be careful with running this in production

    @param {Object} seed JSON object
    @param {Function} cb callback
  */

  this.seed = function(seed) {
    //var self = this;
    //var actions = map(seed, self.createUser.bind(self));
    console.log(seed);
    //return Promise.all(actions);
  };
};

oo.initClass(DocumentStore);

module.exports = DocumentStore;