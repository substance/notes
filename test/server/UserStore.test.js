'use strict';

require('../qunit_extensions');

var UserStore = require('../../server/UserStore');
var userStore;

QUnit.module('server/UserStore', {
  beforeEach: function(assert) {
    userStore = new UserStore();
  }
});

QUnit.moduleDone(function() {
  userStore.shutdown();
});

// TODO: Change them all to Promise API
// -------------------

QUnit.test('Get user', function(assert) {
  var done = assert.async();
  backend.getUser('1', function(err, user) {
    assert.notOk(err, 'Getting an existing user should not error');
    assert.equal(user.userId, '1', 'userId should be "1"');
    done();
  });
});

QUnit.test('Get user that does not exist', function(assert) {
  var done = assert.async();
  backend.getUser('userx', function(err, user) {
    assert.ok(err, 'Getting a user that does not exist should error');
    assert.isNullOrUndefined(user, 'user should be undefined');
    done();
  });
});

QUnit.test('Create a new user', function(assert) {
  var done = assert.async();
  backend.createUser({'userId': '3'}, function(err, newUser) {
    assert.notOk(err, 'Creating a new user should not error');
    assert.equal(newUser.userId, '3', 'New user should have userId 3');

    // Let's see if the user is now really in the db
    backend.getUser('3', function(err, user) {
      assert.notOk(err, 'Getting user after creation should not error');
      assert.equal(user.userId, '3', 'userId should be "3"');
      done();
    });
  });
});

QUnit.test('Create a new user that already exists', function(assert) {
  var done = assert.async();
  backend.createUser({'userId': '1'}, function(err, newUser) {
    assert.ok(err, 'Creating a new user should error');
    assert.isNullOrUndefined(newUser, 'newUser should be undefined');
    done();
  });
});
