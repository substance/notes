'use strict';

require('../qunit_extensions');

var Database = require('../../server/Database');
var UserStore = require('../../server/UserStore');
var SessionStore = require('../../server/SessionStore');
var AuthenticationEngine = require('../../server/AuthenticationEngine');

var db, userStore, sessionStore, engine;

QUnit.module('server/AuthenticationEngine', {
  beforeEach: function(assert) {
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

QUnit.moduleStart(function() {
  db = new Database();
});

QUnit.moduleDone(function() {
  db.shutdown();
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