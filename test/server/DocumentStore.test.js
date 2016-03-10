'use strict';

require('../qunit_extensions');

var documentStoreSeed = require('substance/test/fixtures/collab/documentStoreSeed');
var DocumentStore = require('../../server/DocumentStore');
var documentStore;

var testDocumentStore = require('substance/test/collab/testDocumentStore');
var twoParagraphs = require('substance/test/fixtures/collab/two-paragraphs');

var Database = require('../../server/Database');
var db;

QUnit.module('server/DocumentStore', {
	beforeEach: function(assert) {
		return db.reset()
      .then(function() {
      	documentStore = new DocumentStore({
				  schemas: {
				    'prose-article': {
				      name: 'prose-article',
				      version: '1.0.0',
				      documentFactory: twoParagraphs
				    }
				  },
				  snapshotFrequency: 10,
				  db: db
				});
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
