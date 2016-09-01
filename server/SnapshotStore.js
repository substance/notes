'use strict';

var oo = require('substance/util/oo');
var _ = require('substance/util/helpers');
var Err = require('substance/util/SubstanceError');
var Promise = require('bluebird');

/*
  Implements Substance SnapshotStore API.
*/
function SnapshotStore(config) {
  this.config = config;
  this.db = config.db.connection;
}

SnapshotStore.Prototype = function() {


  /*
    Get Snapshot by documentId and version. If no version is provided
    the highest version available is returned
    
    @return {Object} snapshot record
  */
  this.getSnapshot = function(args, cb) {
    if (!args || !args.documentId) {
      return cb(new Err('InvalidArgumentsError', {
        message: 'args require a documentId'
      }));
    }

    var filters = {document_id: args.documentId};

    if(args.version && args.findClosest) {
      filters['version <='] = args.version;
    } else if (args.version) {
      filters.version = args.version;
    }

    this.db.snapshots.findOne(filters, {order: 'version desc'}, function(err, snapshot) {
      if (err) {
        return cb(new Err('SnapshotStore.ReadError', {
          cause: err
        }));
      }

      if(snapshot) {
        snapshot.documentId = snapshot.document_id;
      }

      cb(null, snapshot);
    });
  };

  /*
    Stores a snapshot for a given documentId and version.

    Please note that an existing snapshot will be overwritten.
  */
  this.saveSnapshot = function(args, cb) {
    var record = {
      document_id: args.documentId,
      version: args.version,
      data: args.data,
      created: args.createdAt || new Date()
    };

    this.db.snapshots.insert(record, function(err, snapshot) {
      if (err) {
        return cb(new Err('SnapshotStore.CreateError', {
          cause: err
        }));
      }

      // Set documentId explictly as it will be used by Document Engine
      snapshot.documentId = snapshot.document_id;

      cb(null, snapshot);
    });
  };

  // Promise based version
  this._saveSnapshot = function(args) {
    return new Promise(function(resolve, reject) {
      this.saveSnapshot(args, function(err, snapshot) {
        if(err) {
          return reject(err);
        }

        resolve(snapshot);
      });
    }.bind(this));
  };

  /*
    Removes a snapshot for a given documentId + version
  */
  this.deleteSnaphot = function(documentId, version, cb) {
    this.db.snapshots.destroy({document_id: documentId, version: version}, function(err, snapshot) {
      if (err) {
        return cb(new Err('SnapshotStore.DeleteError', {
          cause: err
        }));
      }

      // Set documentId explictly as it will be used by Document Engine
      snapshot.documentId = snapshot.document_id;

      cb(null, snapshot);
    });
  };

  /*
    Deletes all snapshots for a given documentId
  */
  this.deleteSnapshotsForDocument = function(documentId, cb) {
    this.db.snapshots.destroy({document_id: documentId}, function(err, snapshots) {
      if (err) {
        return cb(new Err('SnapshotStore.DeleteForDocumentError', {
          cause: err
        }));
      }
      cb(null, snapshots.length);
    });
  };

  /*
    Returns true if a snapshot exists for a certain version
  */
  this.snapshotExists = function(documentId, version, cb) {
    this.db.snapshots.findOne({document_id: documentId}, function(err, snapshot) {
      if (err) {
        return cb(new Err('SnapshotStore.ReadError', {
          cause: err
        }));
      }

      snapshot.documentId = snapshot.document_id;

      cb(null, Boolean(snapshot));
    });
  };

  /*
    Seeds the database
  */
  this.seed = function(seed) {

    var self = this;
    var snapshots = [];
    _.each(seed, function(versions) {
      _.each(versions, function(version) {
        snapshots.push(version);
      });
    });

    // Seed changes in sequence
    return snapshots.reduce(function(promise, snapshot) {
      return promise.then(function() {
        return self._saveSnapshot(snapshot);
      });
    }, Promise.resolve());

  };

};


oo.initClass(SnapshotStore);
module.exports = SnapshotStore;
