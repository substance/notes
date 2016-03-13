'use strict';

require('../qunit_extensions');

var UserStore = require('../../server/UserStore');
var SessionStore = require('../../server/SessionStore');
var AuthenticationEngine = require('../../server/AuthenticationEngine');
var db = require('../db');
var userStore, sessionStore, engine;

QUnit.module('server/AuthenticationEngine', {
  beforeEach: function() {
    return db.reset()
      .then(function() {
        userStore = new UserStore({ db: db});
        return userStore.seed({
          '1': {
            userId: '1',
            name: 'Test',
            loginKey: '1234',
            email: 'test@example.com'
          }
        });
      }).then(function() {
        sessionStore = new SessionStore({ db: db });
        return sessionStore.seed({
          'user1token': {
            sessionToken: 'user1token',
            userId: '1'
          }
        });
      }).then(function() {
        engine = new AuthenticationEngine({
          sessionStore: sessionStore,
          userStore: userStore
        });
      });
  }
});

QUnit.test('Authenticate with session token', function(assert) {
	assert.expect(7);
  var sessionToken = 'user1token';
  return engine.authenticate({sessionToken: sessionToken})
    .then(function(session) {
      assert.ok(session, 'Session should be returned');
      assert.ok(session.user, 'Session should have a rich user object');
      assert.ok(session.sessionToken, 'Session should have a sessionToken');
      assert.equal(session.user.userId,  '1', 'userId should be "1"');
      assert.equal(session.userId,  '1', 'userId should be "1"');
      assert.notEqual(session.sessionToken, sessionToken, 'There should be a new sessionToken assigned');
      return sessionStore.getSession(sessionToken);
    }).catch(function(err) {
    	assert.equal(err.message, 'No session found for token user1token', 'Should be no session found error');
    });
});

QUnit.test('Authenticate with wrong session token', function(assert) {
	assert.expect(1);
  return engine.authenticate({sessionToken: 'xyz'}).catch(function(err) {
  	assert.equal(err.message, 'No session found for token xyz', 'Should be no session found error');
  });
});


QUnit.test('Authenticate with loginKey', function(assert) {
	assert.expect(5);
  var loginKey = '1234';
  return engine.authenticate({loginKey: loginKey})
    .then(function(session) {
      assert.ok(session, 'Session should be returned');
      assert.ok(session.user, 'Session should have a rich user object');
      assert.ok(session.sessionToken, 'Session should have a sessionToken');
      assert.equal(session.user.userId,  '1', 'userId should be "1"');
      assert.equal(session.userId,  '1', 'userId should be "1"');
    });
});

QUnit.test('Authenticate with wrong loginKey', function(assert) {
	assert.expect(1);
  return engine.authenticate({loginKey: 'xyz'}).catch(function(err) {
		assert.equal(err.message, 'No user found for provided loginKey', 'Should be no user found error');
  });
});

QUnit.test('Request login link for an existing email', function(assert) {
  assert.expect(1);
  return engine.requestLoginLink({email: 'test@example.com'}).then(function(result) {
    assert.ok(result.loginKey, 'There should be a new login key');
  });
});

QUnit.test('Request login link for an email that does not exist', function(assert) {
  assert.expect(2);
  return engine.requestLoginLink({email: 'other@email.com'}).then(function(result) {
    assert.ok(result.loginKey, 'There should be a new login key');
    return userStore.getUserByEmail('other@email.com');
  }).then(function(user) {
    assert.ok(user, 'There should be a new user in the database');
  });
});

QUnit.test('Request login link for an invalid email should error', function(assert) {
  assert.expect(1);
  return engine.requestLoginLink({email: 'foo/bar'}).catch(function(err) {
    assert.equal(err.message, 'invalid-email');
  });
});
