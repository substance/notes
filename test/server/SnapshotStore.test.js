'use strict';

var substanceTest = require('substance/test/test').module('server/SnapshotStore');

var Database = require('../../server/Database');
var db = new Database();
var snapshotStoreSeed = require('substance/test/fixtures/snapshotStoreSeed');
var SnapshotStore = require('../../server/SnapshotStore');
var testSnapshotStore = require('substance/test/collab/testSnapshotStore');
var snapshotStore = new SnapshotStore({db: db});
var DocumentStore = require('../../server/DocumentStore');
var documentStore = new DocumentStore({ db: db });
var UserStore = require('../../server/UserStore');
var userStore = new UserStore({ db: db });

function setup() {
  return db.reset()
    .then(function() {
      return userStore.seed({
        'testuser': {
          userId: 'testuser',
          name: 'Test',
          loginKey: '1234',
          email: 'test@example.com'
        }
      });
    })
    .then(function() {
      return documentStore.seed({
        'test-doc': {
          documentId: 'test-doc',
          schemaName: 'prose-article',
          schemaVersion: '1.0.0',
          version: 1,
          info: {
            userId: 'testuser'
          }
        },
        'test-doc-2': {
          documentId: 'test-doc-2',
          schemaName: 'prose-article',
          schemaVersion: '1.0.0',
          version: 1,
          info: {
            userId: 'testuser'
          }
        },
        'my-doc': {
          documentId: 'my-doc',
          schemaName: 'prose-article',
          schemaVersion: '1.0.0',
          version: 1,
          info: {
            userId: 'testuser'
          }
        }
      });
    })
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