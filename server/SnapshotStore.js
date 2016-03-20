'use strict';

var oo = require('substance/util/oo');
var _ = require('substance/util/helpers');
var Err = require('substance/util/Error');

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

    var query = this.db('snapshots')
                .where('documentId', args.documentId)
                .orderBy('version', 'desc')
                .limit(1);

    if(args.version && args.findClosest) {
      query.andWhere('version', '<=', args.version);
    } else if (args.version) {
      query.andWhere('version', args.version);
    }


    query.asCallback(function(err, snapshot) {
      if (err) return cb(new Err('SnapshotStore.ReadError', {
        cause: err
      }));
      snapshot = snapshot[0];
      if (snapshot) snapshot.data = JSON.parse(snapshot.data);
      cb(null, snapshot);
    });
  };

  /*
    Stores a snapshot for a given documentId and version.

    Please note that an existing snapshot will be overwritten.
  */
  this.saveSnapshot = function(args, cb) {
    var record = {
      documentId: args.documentId,
      version: args.version,
      data: JSON.stringify(args.data),
      timestamp: Date.now()
    };
    this.db.table('snapshots').insert(record)
      .asCallback(function(err) {
        if (err) return cb(new Err('SnapshotStore.CreateError', {
          cause: err
        }));
        cb(null, record);
      });
  };

  // Promise based version
  this._saveSnapshot = function(args) {
    var record = {
      documentId: args.documentId,
      version: args.version,
      data: JSON.stringify(args.data),
      timestamp: Date.now()
    };
    return this.db.table('snapshots').insert(record);
  };

  /*
    Removes a snapshot for a given documentId + version
  */
  this.deleteSnaphot = function(documentId, version, cb) {
    var query = this.db('snapshots')
                .where('documentId', documentId)
                .andWhere('version', version)
                .del();

    var args = {
      documentId: documentId,
      version: version
    };
    this.getSnapshot(args, function(err, snapshot){
      if (err) return cb(new Err('SnapshotStore.ReadError', {
        cause: err
      }));
      query.asCallback(function(err) {
        if (err) return cb(new Err('SnapshotStore.DeleteError', {
          cause: err
        }));
        return cb(null, snapshot);
      });
    });
  };

  /*
    Deletes all snapshots for a given documentId
  */
  this.deleteSnapshotsForDocument = function(documentId, cb) {
    var query = this.db('snapshots')
                .where('documentId', documentId)
                .del();

    query.asCallback(function(err, deleteCount) {
        if (err) return cb(new Err('SnapshotStore.DeleteForDocumentError', {
          cause: err
        }));
        return cb(null, deleteCount);
      });
  };

  /*
    Returns true if a snapshot exists for a certain version
  */
  this.snapshotExists = function(documentId, version, cb) {
    var query = this.db('snapshots')
            .where('documentId', documentId)
            .andWhere('version', version)
            .limit(1);

    query.asCallback(function(err, snapshot) {
      if (err) {
        return cb(new Err('SnapshotStore.ReadError', {
          cause: err,
          info: 'Happened within snapshotExists.'
        }));
      }
      cb(null, snapshot.length > 0);
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
