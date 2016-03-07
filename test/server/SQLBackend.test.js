'use strict';

require('../qunit_extensions');

var backendSeed = require('substance/test/fixtures/collab/backendSeed');
var Backend = require('../../server/Backend');
var runBackendTests = require('substance/test/collab/runBackendTests');
var twoParagraphs = require('substance/test/fixtures/collab/two-paragraphs');

// TODO: Daniel, please require knexConfig directly from within the backend
var backend = new Backend({
  schemas: {
    'prose-article': {
      name: 'prose-article',
      version: '1.0.0',
      documentFactory: twoParagraphs
    }
  },
  snapshotFrequency: 10
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

QUnit.moduleDone(function() {
  backend.shutdown();
});

// Runs the offical backend test suite
runBackendTests(backend, QUnit);

QUnit.test('Create two users with same emails', function(assert) {
  var done = assert.async();
  backend.createUser({'userId': '3', email: 'notes@substance.io'}, function(err, newUser) {
    assert.notOk(err, 'Creating a new user should not error');
    assert.equal(newUser.email, 'notes@substance.io', 'New user should have email notes@substance.io');

    backend.createUser({'userId': '4', email: 'notes@substance.io'}, function(err, newUser) {
      assert.ok(err, 'Creating a new user with same email shold return error');
      done();
    });
  });
});

// TODO: Add notes app specific tests (e.g. authentication related etc)