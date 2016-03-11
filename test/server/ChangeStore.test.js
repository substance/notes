'use strict';

require('../qunit_extensions');

var changeStoreSeed = require('substance/test/fixtures/collab/changeStoreSeed');
var ChangeStore = require('../../server/ChangeStore');
var changeStore;
var testChangeStore = require('substance/test/collab/testChangeStore');
var Database = require('../../server/Database');
var db;

QUnit.module('server/ChangeStore', {
  beforeEach: function() {
    return db.reset()
      .then(function() {
        changeStore = new ChangeStore({ db: db });
        var newChangeStoreSeed = JSON.parse(JSON.stringify(changeStoreSeed));
        return changeStore.seed(newChangeStoreSeed);
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
testChangeStore(changeStore, QUnit);