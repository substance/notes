'use strict';

var substanceTest = require('substance/test/test').module('server/SnapshotStore');

var Database = require('../../server/Database');
var db = new Database();
var snapshotStoreSeed = require('substance/test/fixtures/snapshotStoreSeed');
var SnapshotStore = require('../../server/SnapshotStore');
var testSnapshotStore = require('substance/test/collab/testSnapshotStore');
var snapshotStore = new SnapshotStore({db: db});

function setup() {
  return db.reset()
    .then(function() {
      var newSnapshotStoreSeed = JSON.parse(JSON.stringify(snapshotStoreSeed));
      return snapshotStore.seed(newSnapshotStoreSeed);
    });
}

function test(description, fn) {
  substanceTest(description, function(t) {
    setup().then(function(){
      fn(t);
    });
  });
}

// Runs the offical backend test suite
testSnapshotStore(snapshotStore, test);

// This is the end of test suite
test('Closing connection', function(t) {
  db.shutdown();
  t.end();
});