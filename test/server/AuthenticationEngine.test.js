'use strict';

require('../qunit_extensions');

var Database = require('../../server/Database');
var db = new Database();

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

QUnit.moduleDone(function() {
  db.shutdown();
});

QUnit.test('Authenticate with session token', function(assert) {
  return engine.authenticate({sessionToken: '1234'})
    .then(function(session) {
      assert.ok(session, 'Session should be returned');
      assert.ok(session.user, 'Session should have a rich user object');
      assert.equal(session.user.userId,  '1', 'userId should be "1"');
      assert.equal(session.userId,  '1', 'userId should be "1"');
    });
});
