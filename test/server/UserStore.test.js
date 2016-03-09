'use strict';

require('../qunit_extensions');

var Database = require('../../server/Database');
var db;

var UserStore = require('../../server/UserStore');
var userStore;

QUnit.module('server/UserStore', {
  beforeEach: function(assert) {
    return db.reset()
      .then(function() {
        userStore = new UserStore({ db: db });
        return userStore.seed({
          '1': {
            userId: '1',
            name: 'Test',
            loginKey: '1234',
            email: 'test@example.com'
          }
        })
      });
  }
});

QUnit.moduleStart(function() {
  db = new Database();
});

QUnit.moduleDone(function() {
  db.shutdown();
});

QUnit.test('Get user', function(assert) {
  return userStore.getUser('1')
    .then(function(user) {
      assert.equal(user.userId, '1');
    });
});

QUnit.test('Get user that does not exist', function(assert) {
  return userStore.getUser('userx')
    .then(function(user) {
      assert.isNullOrUndefined(user, 'user should be undefined');
    }).catch(function(error) {
      assert.ok(error, 'Getting a user that does not exist should error');
    });
});

QUnit.test('Create a new user', function(assert) {
  return userStore.createUser({'email': 'test@subtsnce.io'})
    .then(function(user) {
      assert.equal(user.userId, '2', 'New user should have userId 2');
      return userStore.getUser('2');
    }).then(function(user) {
      assert.equal(user.email, 'test@subtsnce.io', 'email should be "test@subtsnce.io"');
    }).catch(function(error) {
      assert.notOk(error, 'Creating and getting a new user should not error');
    });
});

QUnit.test('Create a new user that already exists', function(assert) {
  return userStore.createUser({'userId': '1'})
    .then(function(user) {
      assert.isNullOrUndefined(user, 'user should be undefined');
    }).catch(function(error) {
      assert.ok(error, 'Creating a new user should error');
    });
});

QUnit.test('Create a new user with same email', function(assert) {
  return userStore.createUser({'email': 'test@subtsnce.io'})
    .then(function(user) {
      assert.equal(user.userId, '2', 'New user should have userId 2');
      return userStore.createUser({'email': 'test@subtsnce.io'});
    }).then(function(user) {
      assert.isNullOrUndefined(user, 'user should be undefined');
    }).catch(function(error) {
      assert.ok(error, 'Creating a new user with existing email should error');
    });
});

QUnit.test('Update a user record', function(assert) {
  return userStore.updateUser('1', {'name': 'voodoo'})
    .then(function() {
      return userStore.getUser('1');
    }).then(function(user) {
      assert.equal(user.name, 'voodoo', 'user name should be "voodoo"');
    }).catch(function(error) {
      assert.notOk(error, 'Updating a user should not give an error');
    });
});

QUnit.test('Update an email of user record', function(assert) {
  return userStore.createUser({'email': 'test@subtsnce.io'})
    .then(function(user) {
      assert.equal(user.userId, '2', 'New user should have userId 2');
      return userStore.updateUser('1', {'email': 'test@subtsnce.io'});
    }).then(function(user) {
      assert.isNullOrUndefined(user, 'user should be undefined');
    }).catch(function(error) {
      assert.ok(error, 'Updating a user with existing email should give an error');
    });
});

QUnit.test('Remove a user record', function(assert) {
  return userStore.deleteUser('1')
    .then(function() {
      return userStore.getUser('1')
    }).then(function(user) {
      assert.isNullOrUndefined(user, 'user should be undefined');
    }).catch(function(error) {
      assert.ok(error, 'Getting a removed user should give an error');
    });
});
