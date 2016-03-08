'use strict';

require('../qunit_extensions');

var userSeed = require('substance/test/fixtures/collab/backendSeed');
var UserStore = require('../../server/UserStore');

var sessionStore;

QUnit.module('server/SessionStore', {
  beforeEach: function(assert) {
    sessionStore = new SessionStore();
  }
});

QUnit.moduleDone(function() {
  sessionStore.shutdown();
});

// TODO: Change them all to Promise API
// -------------------

QUnit.test('Get an existing session', function(assert) {
  var done = assert.async();
  backend.getSession('user1token', function(err, session) {
    assert.equal(session.sessionToken, 'user1token', 'Session token should match');
    assert.equal(session.user.userId, '1', 'Session should be associated with user 1');
    done();
  });
});

QUnit.test('Get a non-existent session', function(assert) {
  var done = assert.async();
  backend.getSession('user1token', function(err, session) {
    assert.equal(session.sessionToken, 'user1token', 'Session token should match');
    assert.equal(session.user.userId, '1', 'Session should be associated with user 1');
    done();
  });
});

QUnit.test('Authenticate based on existing session token', function(assert) {
  var done = assert.async();
  backend.authenticate({sessionToken: 'user1token'}, function(err, session) {
    assert.notOk(err, 'Authenticating with an existing session token should not error');
    assert.notEqual(session.sessionToken, 'user1token', 'There should be a new token assigned.');
    assert.equal(session.user.userId, '1', 'New should be associated with user 1');

    backend.getSession('user1token', function(err, session) {
      assert.ok(err, 'Looking for old session should error');
      assert.isNullOrUndefined(session, 'session should be undefined');
      done();
    });
  });
});

QUnit.test('Delete existing session', function(assert) {
  var done = assert.async();
  backend.deleteSession('user1token', function(err) {
    assert.notOk(err, 'Deleting an existing session should not error');
    backend.getSession('user1token', function(err, session) {
      assert.ok(err, 'Looking for old session should error');
      assert.isNullOrUndefined(session, 'session should be undefined');
      done();
    });
  });
});


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