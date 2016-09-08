'use strict';

var substanceTest = require('substance/test/test').module('server/ChangeStore');

var changeStoreSeed = require('substance/test/fixtures/changeStoreSeed');
var Database = require('../../server/Database');
var db = new Database();
var ChangeStore = require('../../server/ChangeStore');
var changeStore = new ChangeStore({ db: db });
var DocumentStore = require('../../server/DocumentStore');
var documentStore = new DocumentStore({ db: db });
var UserStore = require('../../server/UserStore');
var userStore = new UserStore({ db: db });

var testChangeStore = require('substance/test/collab/testChangeStore');

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
        }
      });
    })
    .then(function() {
      var newChangeStoreSeed = JSON.parse(JSON.stringify(changeStoreSeed));
      return changeStore.seed(newChangeStoreSeed);
    });
}

function test(description, fn) {
  substanceTest(description, function(t) {
    setup().then(function(){
      fn(t);
    });
  });
}

// Runs the offical document store test suite
testChangeStore(changeStore, test);

// This is the end of test suite
test('Closing connection', function(t) {
  db.shutdown();
  t.end();
});