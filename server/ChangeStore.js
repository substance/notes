"use strict";

var oo = require('substance/util/oo');
var _ = require('substance/util/helpers');
var has = require('lodash/has');
var Err = require('substance/util/Error');

/*
  Implements the Substance DocumentStore API.
*/
function ChangeStore(config) {
  this.config = config;
  this.db = config.db.connection;
}

ChangeStore.Prototype = function() {

  // Changes API
  // -----------

  /*
    Add a change to a document

    @param {Object} args arguments
    @param {String} args.documentId document id
    @param {Object} args.change JSON object
    @param {Function} cb callback
  */
  this.addChange = function(args, cb) {
    var self = this;

    if(!has(args, 'documentId')) {
      return cb(new Err('ChangeStore.CreateError', {
        message: 'documentId is mandatory'
      }));
    }

    var userId = null;
    if(args.change.info) {
      userId = args.change.info.userId;
    }
    
    self.getVersion(args.documentId, function(err, headVersion) {
      if (err) return cb(new Err('ChangeStore.GetVersionError', {
        cause: err
      }));
      var version = headVersion + 1;
      var record = {
        documentId: args.documentId,
        version: version,
        data: JSON.stringify(args.change),
        createdAt: args.createdAt || new Date(),
        userId: userId
      };

      self.db.table('changes').insert(record)
        .asCallback(function(err) {
          if (err) return cb(new Err('ChangeStore.CreateError', {
            cause: err
          }));
          cb(null, version);
        });
    });
  };

  /*
    Add a change to a document

    Promise based version

    @param {Object} args arguments
    @param {String} args.documentId document id
    @param {Object} args.change JSON object
  */
  this._addChange = function(args) {
    var self = this;
    var version;

    var userId = null;
    if(args.change.info) {
      userId = args.change.info.userId;
    }

    return self._getVersion(args.documentId)
      .then(function(headVersion) {
        version = headVersion + 1;
        var record = {
          documentId: args.documentId,
          version: version,
          data: JSON.stringify(args.change),
          createdAt: args.createdAt || new Date(),
          userId: userId
        };
        return self.db.table('changes').insert(record);
      })
      .then(function() {
        return version;
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

    if(args.sinceVersion < 0) {
      return cb(new Err('ChangeStore.ReadError', {
        message: 'sinceVersion should be grater or equal then 0'
      }));
    }

    if(args.toVersion < 0) {
      return cb(new Err('ChangeStore.ReadError', {
        message: 'toVersion should be grater then 0'
      }));
    }

    if(args.sinceVersion >= args.toVersion) {
      return cb(new Err('ChangeStore.ReadError', {
        message: 'toVersion should be greater then sinceVersion'
      }));
    }

    if(!has(args, 'sinceVersion')) args.sinceVersion = 0;
      
    var query = self.db('changes')
                .select('data')
                .where('documentId', args.documentId)
                .andWhere('version', '>', args.sinceVersion)
                .orderBy('version', 'asc');

    if(args.toVersion) query.andWhere('version', '<=', args.toVersion);

    query.asCallback(function(err, changes) {
      if (err) return cb(new Err('ChangeStore.ReadError', {
        cause: err
      }));
      changes = _.map(changes, function(c) {return JSON.parse(c.data); });
      self.getVersion(args.documentId, function(err, headVersion) {
        if (err) return cb(new Err('ChangeStore.GetVersionError', {
          cause: err
        }));
        var res = {
          version: headVersion,
          changes: changes
        };
        return cb(null, res);
      });
    });
  };

  /*
    Remove all changes of a document

    @param {String} id document id
    @param {Function} cb callback
  */
  this.deleteChanges = function(id, cb) {
    var query = this.db('changes')
                .where('documentId', id)
                .del();

    query.asCallback(function(err, deletedCount) {
      if (err) return cb(new Err('ChangeStore.DeleteError', {
        cause: err
      }));
      return cb(null, deletedCount);
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
                .where('documentId', id)
                .count();

    query.asCallback(function(err, count) {
      if (err) return cb(new Err('ChangeStore.GetVersionError', {
        cause: err
      }));
      var result = count[0]['count(*)'];
      return cb(null, result);
    });
  };

  /*
    Get the version number for a document

    Promise based version

    @param {String} id document id
  */
  this._getVersion = function(id) {
    var query = this.db('changes')
                .where('documentId', id)
                .count();

    return query.then(function(count) {
      var result = count[0]['count(*)'];
      return result;
    });
  };

  /*
    Get documents where user is collaborator
  */
  this.getCollaboratedDocuments = function(userId, cb) {
    var query = this.db('changes')
                .where('userId', userId)
                .distinct('documentId')
                .select('documentId');

    query.asCallback(function(err, docs) {
      if (err) return cb(new Err('ChangeStore.getCollaboratedDocumentsError', {
        cause: err
      }));
      docs = _.map(docs, 'documentId');
      return cb(null, docs);
    });
  };

  /*
    Get ten latest except very latest and number of collaborators for a document
  */
  this.getCollaborators = function(documentId, cb) {
    var query = this.db('changes')
                .where('documentId', documentId)
                .distinct('userId');

    query.asCallback(function(err, users) {
      if (err) return cb(new Err('ChangeStore.getCollaboratorsError', {
        cause: err
      }));
      return cb(null, users);
    });
  };

  /*
    Resets the database and loads a given seed object

    Be careful with running this in production

    @param {Object} seed JSON object
    @param {Function} cb callback
  */

  this.seed = function(changesets) {
    var self = this;
    var changes = [];
    _.each(changesets, function(set, docId) {
      _.each(set, function(change) {
        var args = {
          documentId: docId,
          change: change
        };
        changes.push(args);
      });
    });

    // Seed changes in sequence
    return changes.reduce(function(promise, change) {
      return promise.then(function() {
        return self._addChange(change);
      });
    }, Promise.resolve());
  };
};

oo.initClass(ChangeStore);

module.exports = ChangeStore;