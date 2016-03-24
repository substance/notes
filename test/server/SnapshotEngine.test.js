'use strict';

require('../qunit_extensions');

var documentStoreSeed = require('substance/test/fixtures/collab/documentStoreSeed');
var changeStoreSeed = require('substance/test/fixtures/collab/changeStoreSeed');
var snapshotStoreSeed = require('substance/test/fixtures/collab/snapshotStoreSeed');

var DocumentStore = require('../../server/DocumentStore');
var SnapshotStore = require('../../server/SnapshotStore');
var ChangeStore = require('../../server/ChangeStore');

var SnapshotEngine = require('substance/collab/SnapshotEngine');
var testSnapshotEngine = require('substance/test/collab/testSnapshotEngine');
var testSnapshotEngineWithStore = require('substance/test/collab/testSnapshotEngineWithStore');
var twoParagraphs = require('substance/test/fixtures/collab/two-paragraphs');

var db = require('../db');

/*
  These can be considered integration tests for the custom SnapshotStore implementation.
  It just tests with real use-cases like requesting a snapshot which involves a fetching
  the closest available snapshot in the store plus applying additional changes.
*/

var documentStore = new DocumentStore({db: db});
var changeStore = new ChangeStore({db: db});
var snapshotStore = new SnapshotStore({db: db});

var snapshotEngine = new SnapshotEngine({
  documentStore: documentStore,
  changeStore: changeStore,
  schemas: {
    'prose-article': {
      name: 'prose-article',
      version: '1.0.0',
      documentFactory: twoParagraphs
    }
  }
});

var snapshotEngineWithStore = new SnapshotEngine({
  documentStore: documentStore,
  changeStore: changeStore,
  snapshotStore: snapshotStore,
  schemas: {
    'prose-article': {
      name: 'prose-article',
      version: '1.0.0',
      documentFactory: twoParagraphs
    }
  }
});

QUnit.module('collab/SnapshotEngine', {
  beforeEach: function() {
    var newDocumentStoreSeed = JSON.parse(JSON.stringify(documentStoreSeed));
    var newChangeStoreSeed = JSON.parse(JSON.stringify(changeStoreSeed));
    var newSnapshotStoreSeed = JSON.parse(JSON.stringify(snapshotStoreSeed));

    return db.reset().then(function() {
      return documentStore.seed(newDocumentStoreSeed);
    }).then(function() {
      return changeStore.seed(newChangeStoreSeed);
    }).then(function() {
      return snapshotStore.seed(newSnapshotStoreSeed);
    });
  }
});

// Run the generic testsuite with an engine that does not have a store attached
testSnapshotEngine(snapshotEngine, twoParagraphs, QUnit);
// Run the same testsuite but this time with a store
testSnapshotEngine(snapshotEngineWithStore, twoParagraphs, QUnit);

// Run tests that are only relevant when a snapshot store is provided to the engine
testSnapshotEngineWithStore(snapshotEngineWithStore, twoParagraphs, QUnit);