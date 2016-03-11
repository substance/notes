'use strict';

require('../qunit_extensions');

var changeStoreSeed = require('substance/test/fixtures/collab/changeStoreSeed');
var ChangeStore = require('../../server/ChangeStore');
var changeStore = new ChangeStore({ db: db });

var testChangeStore = require('substance/test/collab/testChangeStore');

QUnit.module('server/ChangeStore', {
  beforeEach: function() {
    return db.reset()
      .then(function() {
        var newChangeStoreSeed = JSON.parse(JSON.stringify(changeStoreSeed));
        return changeStore.seed(newChangeStoreSeed);
      });
    }
});

// Runs the offical document store test suite
testChangeStore(changeStore, QUnit);