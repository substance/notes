'use strict';

require('../qunit_extensions');

var knexConfig = require('../../knexfile');
var backendSeed = require('substance/test/fixtures/collab/backendSeed');
var Backend = require('../../server/Backend');
var runBackendTests = require('substance/test/collab/runBackendTests');

var backend = new Backend({
  knexConfig: knexConfig,
  ArticleClass: require('substance/packages/prose-editor/ProseArticle')
});

QUnit.module('server/SQLBackend', {
  beforeEach: function(assert) {
    var done = assert.async();
    backend.seed(backendSeed, function(err) {
      if (err) {
        return console.error(err);
      } else {
        done();
      }
    });
  }
});

// Runs the offical backend test suite
runBackendTests(backend, QUnit);

// TODO: Add notes app specific tests (e.g. authentication related etc)