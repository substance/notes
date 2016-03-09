'use strict';

require('../qunit_extensions');

var Database = require('../../server/Database');
var db;
var UserStore = require('../../server/UserStore');
var SessionStore = require('../../server/SessionStore');
var AuthenticationEngine = require('../../server/AuthenticationEngine');

var userStore, sessionStore, engine;

QUnit.module('server/UserStore', {
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
    }).then(function(oldSession) {
      assert.notOk(oldSession, 'The old session should be gone');
    }).catch(function(err) {
      assert.ok(err, 'There should be no old session');
    });
});

QUnit.test('Authenticate with wrong session token', function(assert) {
  return engine.authenticate({sessionToken: 'xyz'})
    .then(function(session) {
      assert.notOk(session, 'There should not be a session for a wrong session token');
    }).catch(function(err) {
      assert.ok(err, 'There should be an error');
    });
});

QUnit.test('Authenticate with loginKey', function(assert) {
  var loginKey = '1234';
  return engine.authenticate({loginKey: loginKey})
    .then(function(session) {
      assert.ok(session, 'Session should be returned');
      assert.ok(session.user, 'Session should have a rich user object');
      assert.ok(session.sessionToken, 'Session should have a sessionToken');
      assert.equal(session.user.userId,  '1', 'userId should be "1"');
      assert.equal(session.userId,  '1', 'userId should be "1"');
    }).catch(function(err) {
      assert.notOk(err, 'There should be no error');
    });
});

QUnit.test('Authenticate with wrong loginKey', function(assert) {
  return engine.authenticate({sessionToken: 'xyz'})
    .then(function(session) {
      assert.notOk(session, 'There should not be a session for a wrong session token');
    }).catch(function(err) {
      assert.ok(err, 'There should be an error');
    });
});
