'use strict';

var substanceTest = require('substance/test/test').module('server/DocumentStore');

var Database = require('../../server/Database');
var db = new Database();
var testDocumentStore = require('substance/test/collab/testDocumentStore');
var DocumentStore = require('../../server/DocumentStore');

var documentStoreSeed = {
  'test-doc': {
    documentId: 'test-doc',
    schemaName: 'prose-article',
    schemaVersion: '1.0.0',
    version: 1,
    info: {
      userId: 1
    }
  }
};

var documentStore = new DocumentStore({ db: db });

function setup() {
  return db.reset()
    .then(function() {
      var newDocumentStoreSeed = JSON.parse(JSON.stringify(documentStoreSeed));
      return documentStore.seed(newDocumentStoreSeed);
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
testDocumentStore(documentStore, test);

test('List documents', function(t) {
  documentStore.listDocuments({}, {}, function(err, documents) {
    t.isNil(err, 'Should not error');
    t.equal(documents.length, 1, 'There should be one document returned');
    t.equal(documents[0].userId, '1', 'First doc should have userId "1"');
    t.equal(documents[0].documentId, 'test-doc', 'documentId should be "test-doc"');
    t.end();
  });
});

test('List documents with matching filter', function(t) {
  documentStore.listDocuments({userId: '1'}, {}, function(err, documents) {
    t.isNil(err, 'Should not error');
    t.equal(documents.length, 1, 'There should be one document returned');
    t.equal(documents[0].userId, '1', 'First doc should have userId "1"');
    t.equal(documents[0].documentId, 'test-doc', 'documentId should be "test-doc"');
    t.end();
  });
});

test('List documents with filter that does not match', function(t) {
  documentStore.listDocuments({userId: 'userx'}, {}, function(err, documents) {
    t.isNil(err, 'Should not error');
    t.equal(documents.length, 0, 'There should be no matches');
    t.end();
  });
});

// This is the end of test suite
test('Closing connection', function(t) {
  db.shutdown();
  t.end();
});