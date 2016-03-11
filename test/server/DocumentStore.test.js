'use strict';

require('../qunit_extensions');

var documentStoreSeed = require('substance/test/fixtures/collab/documentStoreSeed');
var testDocumentStore = require('substance/test/collab/testDocumentStore');
var DocumentStore = require('../../server/DocumentStore');
var Database = require('../../server/Database');

var db, documentStore;

QUnit.module('server/DocumentStore', {
	beforeEach: function() {
		return db.reset()
      .then(function() {
      	documentStore = new DocumentStore({ db: db });
				var newDocumentStoreSeed = JSON.parse(JSON.stringify(documentStoreSeed));
				return documentStore.seed(newDocumentStoreSeed);
  		});
  	}
});

QUnit.moduleStart(function() {
  db = new Database();
});

QUnit.moduleDone(function() {
  db.shutdown();
});

// Runs the offical document store test suite
testDocumentStore(documentStore, QUnit);


// TODO: activate app specific APIs.

  // QUnit.test('List documents', function(assert) {
  //   var done = assert.async();
  //   store.listDocuments({}, function(err, documents) {
  //     assert.notOk(err, 'Should not error');
  //     assert.equal(documents.length, 1, 'There should be one document returned');
  //     assert.equal(documents[0].userId, '1', 'First doc should have userId "1"');
  //     assert.equal(documents[0].documentId, 'test-doc', 'documentId should be "test-doc"');
  //     done();
  //   });
  // });

  // QUnit.test('List documents with matching filter', function(assert) {
  //   var done = assert.async();
  //   store.listDocuments({userId: '1'}, function(err, documents) {
  //     assert.notOk(err, 'Should not error');
  //     assert.equal(documents.length, 1, 'There should be one document returned');
  //     assert.equal(documents[0].userId, '1', 'First doc should have userId "1"');
  //     assert.equal(documents[0].documentId, 'test-doc', 'documentId should be "test-doc"');
  //     done();
  //   });
  // });

  // QUnit.test('List documents with filter that does not match', function(assert) {
  //   var done = assert.async();
  //   store.listDocuments({userId: 'userx'}, function(err, documents) {
  //     assert.notOk(err, 'Should not error');
  //     assert.equal(documents.length, 0, 'There should be no matches');
  //     done();
  //   });
  // });