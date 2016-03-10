'use strict';

require('../qunit_extensions');

var Database = require('../../server/Database');
var db;

var SessionStore = require('../../server/SessionStore');
var sessionStore;

QUnit.module('server/SessionStore', {
  beforeEach: function() {
    return db.reset()
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
});

QUnit.moduleStart(function() {
  db = new Database();
});

QUnit.moduleDone(function() {
  db.shutdown();
});

// TODO: Change them all to Promise API
// -------------------

QUnit.test('Create session', function(assert) {
	return sessionStore.createSession({userId: 'testuser'})
		.then(function(session) {
    	assert.equal(session.userId, 'testuser', 'Session should be associated with testuser');
		}).catch(function(error){
			assert.notOk(error, 'Should not error');
		});
});


QUnit.test('Get an existing session', function(assert) {
	return sessionStore.getSession('user1token')
		.then(function(session) {
			assert.equal(session.sessionToken, 'user1token', 'Session token should match');
    	assert.equal(session.userId, 'testuser', 'Session should be associated with testuser');
		}).catch(function(error){
			assert.notOk(error, 'Should not error');
		});
});

QUnit.test('Get a non-existent session', function(assert) {
	return sessionStore.getSession('user2token')
		.then(function(session) {
      assert.isNullOrUndefined(session, 'session should be undefined');
		}).catch(function(error){
			assert.ok(error, 'Should return error for a non-existing session');
		});
});

QUnit.test('Delete existing session', function(assert) {
	return sessionStore.deleteSession('user1token')
		.then(function() {
			return sessionStore.getSession('user1token');
		}).then(function(session) {
			assert.isNullOrUndefined(session, 'session should be undefined');
		}).catch(function(error){
			assert.ok(error, 'Should return error for a non-existing session');
		});
});

QUnit.test('Delete session should return deleted session', function(assert) {
	return sessionStore.deleteSession('user1token')
		.then(function(session) {
			assert.equal(session.sessionToken, 'user1token', 'Deleted session token should match');
    	assert.equal(session.userId, '1', 'Deleted session should be associated with user 1');
		}).catch(function(error){
			assert.notOk(error, 'Should not error');
		});
});

QUnit.test('Delete a non-existent session', function(assert) {
	return sessionStore.deleteSession('user2token')
		.then(function(session) {
			assert.isNullOrUndefined(session, 'session should be undefined');
		}).catch(function(error){
			assert.ok(error, 'Should return error for a non-existing session');
		});
});