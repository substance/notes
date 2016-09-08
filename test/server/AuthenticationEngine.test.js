'use strict';

var substanceTest = require('substance/test/test').module('server/AuthenticationEngine');

var Database = require('../../server/Database');
var UserStore = require('../../server/UserStore');
var SessionStore = require('../../server/SessionStore');
var AuthenticationEngine = require('../../server/AuthenticationEngine');

var db, userStore, sessionStore, engine;

function setup() {
  db = new Database();
  return db.reset()
    .then(function() {
      return db.shutdown();
    })
    .then(function() {
      db = new Database();
      userStore = new UserStore({ db: db});
      return userStore.seed({
        '1': {
          userId: '1',
          name: 'Test',
          loginKey: '1234',
          email: 'test@example.com'
        }
      });
    })
    .then(function() {
      sessionStore = new SessionStore({ db: db });
      return sessionStore.seed({
        'user1token': {
          sessionToken: 'user1token',
          userId: '1'
        }
      });
    })
    .then(function() {
      engine = new AuthenticationEngine({
        sessionStore: sessionStore,
        userStore: userStore
      });
    });
}

function teardown() {
  db.shutdown();
}

function test(description, fn) {
  substanceTest(description, function(t) {
    setup().then(function(){
      t.once('end', teardown);
      fn(t);
    });
  });
}

test('Authenticate with session token', function(t) {
  t.plan(4);
  var sessionToken = 'user1token';
  return engine.authenticate({sessionToken: sessionToken})
    .then(function(session) {
      t.isNotNil(session, 'Session should be returned');
      t.isNotNil(session.sessionToken, 'Session should have a sessionToken');
      t.equal(session.user.userId, '1', 'userId should be "1"');
      t.equal(session.userId, '1', 'userId should be "1"');
    });
});

test('Authenticate with wrong session token', function(t) {
  t.plan(1);
  return engine.authenticate({sessionToken: 'xyz'}).catch(function(err) {
    t.equal(err.name, 'AuthenticationError', 'Should throw the right error');
  });
});

test('Authenticate with loginKey', function(t) {
  t.plan(5);
  var loginKey = '1234';
  return engine.authenticate({loginKey: loginKey})
    .then(function(session) {
      t.isNotNil(session, 'Session should be returned');
      t.isNotNil(session.user, 'Session should have a rich user object');
      t.isNotNil(session.sessionToken, 'Session should have a sessionToken');
      t.equal(session.user.userId, '1', 'userId should be "1"');
      t.equal(session.userId, '1', 'userId should be "1"');
    });
});

test('Authenticate with wrong loginKey', function(t) {
  t.plan(1);
  return engine.authenticate({loginKey: 'xyz'}).catch(function(err) {
    t.equal(err.name, 'AuthenticationError', 'Should throw the right error');
  });
});

// Email system tests

// test('Request login link for an existing email', function(t) {
//   t.plan(1);
//   return engine.requestLoginLink({email: 'test@example.com'}).then(function(result) {
//     t.isNotNil(result.loginKey, 'There should be a new login key');
//   });
// });

// test('Request login link for an email that does not exist', function(t) {
//   t.plan(2);
//   return engine.requestLoginLink({email: 'other@email.com'}).then(function(result) {
//     t.isNotNil(result.loginKey, 'There should be a new login key');
//     return userStore.getUserByEmail('other@email.com');
//   })
//   .then(function(user) {
//     t.isNotNil(user, 'There should be a new user in the database');
//   });
// });

// test('Request login link for an invalid email should error', function(t) {
//   t.plan(1);
//   return engine.requestLoginLink({email: 'foo/bar'}).catch(function(err) {
//     t.equal(err.message, 'invalid-email');
//   });
// });
