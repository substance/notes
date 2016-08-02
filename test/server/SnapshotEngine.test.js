'use strict';

var substanceTest = require('substance/test/test').module('server/SnapshotEngine');

var documentStoreSeed = require('substance/test/fixtures/documentStoreSeed');
var changeStoreSeed = require('substance/test/fixtures/changeStoreSeed');
var snapshotStoreSeed = require('substance/test/fixtures/snapshotStoreSeed');

var DocumentStore = require('../../server/DocumentStore');
var SnapshotStore = require('../../server/SnapshotStore');
var ChangeStore = require('../../server/ChangeStore');

var SnapshotEngine = require('substance/collab/SnapshotEngine');
var testSnapshotEngine = require('substance/test/collab/testSnapshotEngine');
var testSnapshotEngineWithStore = require('substance/test/collab/testSnapshotEngineWithStore');

var Database = require('../../server/Database');
var db = new Database();

/*
  These can be considered integration tests for the custom SnapshotStore implementation.
  It just tests with real use-cases like requesting a snapshot which involves a fetching
  the closest available snapshot in the store plus applying additional changes.
*/

var Configurator = require('substance/util/Configurator');
var TestArticle = require('substance/test/model/TestArticle');
var TestMetaNode = require('substance/test/model/TestMetaNode');

var documentStore = new DocumentStore({db: db});
var changeStore = new ChangeStore({db: db});
var snapshotStore = new SnapshotStore({db: db});

var configurator = new Configurator();
configurator.defineSchema({
  name: 'prose-article',
  ArticleClass: TestArticle,
  defaultTextType: 'paragraph'
});
configurator.addNode(TestMetaNode);

var snapshotEngine = new SnapshotEngine({
  configurator: configurator,
  documentStore: documentStore,
  changeStore: changeStore
});

var snapshotEngineWithStore = new SnapshotEngine({
  configurator: configurator,
  documentStore: documentStore,
  changeStore: changeStore,
  snapshotStore: snapshotStore
});

function setup() {
  var newDocumentStoreSeed = JSON.parse(JSON.stringify(documentStoreSeed));
  var newChangeStoreSeed = JSON.parse(JSON.stringify(changeStoreSeed));
  var newSnapshotStoreSeed = JSON.parse(JSON.stringify(snapshotStoreSeed));

  return db.reset()
    .then(function() {
      return documentStore.seed(newDocumentStoreSeed);
    }).then(function() {
      return changeStore.seed(newChangeStoreSeed);
    }).then(function() {
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

// Run the generic testsuite with an engine that does not have a store attached
testSnapshotEngine(snapshotEngine, test);
// Run the same testsuite but this time with a store
testSnapshotEngine(snapshotEngineWithStore, test);

// Run tests that are only relevant when a snapshot store is provided to the engine
testSnapshotEngineWithStore(snapshotEngineWithStore, test);

// This is the end of test suite
test('Closing connection', function(t) {
  db.shutdown();
  t.end();
});