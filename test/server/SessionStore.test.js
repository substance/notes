'use strict';

require('../qunit_extensions');

var db = require('../db');
var SessionStore = require('../../server/SessionStore');
var sessionStore = new SessionStore({ db: db });

QUnit.module('server/SessionStore', {
  beforeEach: function() {
    return db.reset()
      .then(function() {
        return sessionStore.seed({
          'user1token': {
			      'userId': 'testuser',
			      'sessionToken': 'user1token'
			    }
        });
      });
  }
});

QUnit.test('Create session', function(assert) {
	assert.expect(1);
	return sessionStore.createSession({userId: 'testuser'})
		.then(function(session) {
    	assert.equal(session.userId, 'testuser', 'Session should be associated with testuser');
		});
});

QUnit.test('Get an existing session', function(assert) {
	assert.expect(2);
	return sessionStore.getSession('user1token')
		.then(function(session) {
			assert.equal(session.sessionToken, 'user1token', 'Session token should match');
    	assert.equal(session.userId, 'testuser', 'Session should be associated with testuser');
		});
});

QUnit.test('Get a non-existent session', function(assert) {
	assert.expect(1);
	return sessionStore.getSession('user2token').catch(function(err){
		assert.equal(err.message, 'No session found for token user2token', 'Should return session not found error');
	});
});

QUnit.test('Delete existing session', function(assert) {
	assert.expect(3);
	return sessionStore.deleteSession('user1token')
		.then(function(session) {
			assert.equal(session.sessionToken, 'user1token', 'Deleted session token should match');
    	assert.equal(session.userId, 'testuser', 'Deleted session should be associated with user testuser');
			return sessionStore.getSession('user1token');
		}).catch(function(err){
			assert.equal(err.message, 'No session found for token user1token', 'Should return session not found error');
		});
});

QUnit.test('Delete a non-existent session', function(assert) {
	assert.expect(1);
	return sessionStore.deleteSession('user2token').catch(function(err) {
    assert.equal(err.name, 'SessionStore.DeleteError', 'Should throw the right error');
  });
});