"use strict";

var oo = require('substance/util/oo');
var _ = require('substance/util/helpers');
var has = require('lodash/has');
var map = require('lodash/map');
var Err = require('substance/util/SubstanceError');
var Promise = require('bluebird');

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
    @param {Callback} cb callback
    @returns {Callback}
  */
  this.addChange = function(args, cb) {
    if(!has(args, 'documentId')) {
      return cb(new Err('ChangeStore.CreateError', {
        message: 'documentId is mandatory'
      }));
    }

    var userId = null;
    if(args.change.info) {
      userId = args.change.info.userId;
    }
    
    this.getVersion(args.documentId, function(err, headVersion) {
      if (err) {
        return cb(new Err('ChangeStore.GetVersionError', {
          cause: err
        }));
      }
      var version = headVersion + 1;
      var record = {
        documentId: args.documentId,
        version: version,
        data: args.change,
        createdAt: args.createdAt || new Date(),
        userId: userId
      };

      this.db.changes.insert(record, function(err, change) {
        if (err) {
          return cb(new Err('ChangeStore.CreateError', {
            cause: err
          }));
        }

        cb(null, change.version);
      });

    }.bind(this));
  };

  /*
    Add a change to a document

    Promise based version

    @param {Object} args arguments
    @param {String} args.documentId document id
    @param {Object} args.change JSON object
    @returns {Promise}
  */
  this._addChange = function(args) {    
    return new Promise(function(resolve, reject) {
      if(!has(args, 'documentId')) {
        return reject(new Err('ChangeStore.CreateError', {
          message: 'documentId is mandatory'
        }));
      }

      var userId = null;
      if(args.change.info) {
        userId = args.change.info.userId;
      }

      this.getVersion(args.documentId, function(err, headVersion) {
        if (err) {
          return reject(new Err('ChangeStore.GetVersionError', {
            cause: err
          }));
        }
        var version = headVersion + 1;
        var record = {
          documentId: args.documentId,
          version: version,
          data: args.change,
          createdAt: args.createdAt || new Date(),
          userId: userId
        };

        this.db.changes.insert(record, function(err, change) {
          if (err) {
            return reject(new Err('ChangeStore.CreateError', {
              cause: err
            }));
          }

          resolve(change.version);
        });

      }.bind(this));
    }.bind(this));
  };

  /*
    Get changes from the DB

    @param {Object} args arguments
    @param {String} args.documentId document id
    @param {String} args.sinceVersion changes since version (0 = all changes, 1 all except first change)
    @param {Callback} cb callback
    @returns {Callback}
  */
  this.getChanges = function(args, cb) {
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

    var query = {
      'documentId': args.documentId,
      'version >': args.sinceVersion
    };

    if(args.toVersion) query['version <='] = args.toVersion;

    var options = {
      order: 'version asc',
      columns: ["data"]
    };

    this.db.changes.find(query, options, function(err, changes) {
      if (err) {
        return cb(new Err('ChangeStore.ReadError', {
          cause: err
        }));
      }

      // transform results to an array of changes 
      changes = map(changes, function(c) {return c.data; });

      this.getVersion(args.documentId, function(err, headVersion) {
        if (err) {
          return cb(new Err('ChangeStore.ReadError', {
            cause: err
          }));
        }

        var res = {
          version: headVersion,
          changes: changes
        };

        cb(null, res);
      });
    }.bind(this));
  };

  /*
    Remove all changes of a document

    @param {String} id document id
    @param {Callback} cb callback
    @returns {Callback}
  */
  this.deleteChanges = function(id, cb) {
    this.db.changes.destroy({documentId: id}, function(err, changes) {
      if (err) {
        return cb(new Err('ChangeStore.DeleteError', {
          cause: err
        }));
      }
      cb(null, changes.length);
    });
  };

  /*
    Get the version number for a document

    @param {String} id document id
    @param {Callback} cb callback
    @returns {Callback}
  */
  this.getVersion = function(id, cb) {
    this.db.changes.count({documentId: id}, function(err, count) {
      if (err) {
        return cb(new Err('ChangeStore.GetVersionError', {
          cause: err
        }));
      }

      cb(null, parseInt(count, 10));
    });
  };

  /*
    Get the version number for a document

    Promise based version

    @param {String} id document id
    @returns {Promise}
  */
  this._getVersion = function(id) {
    return new Promise(function(resolve, reject) {
      this.db.changes.count({documentId: id}, function(err, count) {
        if (err) {
          return reject(new Err('ChangeStore.GetVersionError', {
            cause: err
          }));
        }

        resolve(parseInt(count, 10));
      });
    }.bind(this));
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