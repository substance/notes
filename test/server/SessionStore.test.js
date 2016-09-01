'use strict';

var substanceTest = require('substance/test/test').module('server/SessionStore');

var Database = require('../../server/Database');
var UserStore = require('../../server/UserStore');
var SessionStore = require('../../server/SessionStore');

var db, userStore, sessionStore;

function setup() {
  db = new Database();
  return db.reset()
    .then(function() {
      userStore = new UserStore({ db: db });
      return userStore.seed({
        'testuser': {
          userId: 'testuser',
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
          'userId': 'testuser',
          'sessionToken': 'user1token'
        }
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

test('Create session', function(t) {
  t.plan(1);
  return sessionStore.createSession({userId: 'testuser'})
    .then(function(session) {
      t.equal(session.userId, 'testuser', 'Session should be associated with testuser');
    });
});

test('Get an existing session', function(t) {
  t.plan(2);
  return sessionStore.getSession('user1token')
    .then(function(session) {
      t.equal(session.sessionToken, 'user1token', 'Session token should match');
      t.equal(session.userId, 'testuser', 'Session should be associated with testuser');
    });
});

test('Get a non-existent session', function(t) {
  t.plan(1);
  return sessionStore.getSession('user2token').catch(function(err){
    t.equal(err.message, 'No session found for token user2token', 'Should return session not found error');
  });
});

test('Delete existing session', function(t) {
  t.plan(3);
  return sessionStore.deleteSession('user1token')
    .then(function(session) {
      t.equal(session.sessionToken, 'user1token', 'Deleted session token should match');
      t.equal(session.userId, 'testuser', 'Deleted session should be associated with user testuser');
      return sessionStore.getSession('user1token');
    }).catch(function(err){
      t.equal(err.message, 'No session found for token user1token', 'Should return session not found error');
    });
});

test('Delete a non-existent session', function(t) {
  t.plan(1);
  return sessionStore.deleteSession('user2token').catch(function(err) {
    t.equal(err.name, 'SessionStore.DeleteError', 'Should throw the right error');
  });
});