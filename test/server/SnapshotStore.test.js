'use strict';

require('../qunit_extensions');

var snapshotStoreSeed = require('substance/test/fixtures/collab/snapshotStoreSeed');
var SnapshotStore = require('../../server/SnapshotStore');
var testSnapshotStore = require('substance/test/collab/testSnapshotStore');
var db = require('../db');
var snapshotStore = new SnapshotStore({db: db});

QUnit.module('collab/SnapshotStore', {
  beforeEach: function() {
    // Make sure we create a new seed instance, as data ops
    // are performed directly on the seed object
    var newSnapshotStoreSeed = JSON.parse(JSON.stringify(snapshotStoreSeed));
    return db.reset().then(function() {
      return snapshotStore.seed(newSnapshotStoreSeed);
    });
  }
});

// Runs the offical backend test suite
testSnapshotStore(snapshotStore, QUnit);