"use strict";

// var fs = require('fs');
// var path = require('path');
// var each = require('lodash/each');
// var async = require('async');
var oo = require('substance/util/oo');

var _ = require('substance/util/helpers');

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
    Resets the database and loads a given seed object

    Be careful with running this in production

    @param {Object} seed JSON object
    @param {Function} cb callback
  */

  this.seed = function(changes) {
    //var self = this;
    //var actions = map(seed, self.createUser.bind(self));
    console.log(changes);
    //return Promise.all(actions);
  };
};

oo.initClass(ChangeStore);

module.exports = ChangeStore;

