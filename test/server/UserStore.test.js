'use strict';

require('../qunit_extensions');

var UserStore = require('../../server/UserStore');
var userStore = new UserStore({ db: db });

QUnit.module('server/UserStore', {
  beforeEach: function() {
    return db.reset()
      .then(function() {
        return userStore.seed({
          'testuser': {
            userId: 'testuser',
            name: 'Test',
            loginKey: '1234',
            email: 'test@example.com'
          }
        });
      });
  }
});

QUnit.test('Get user', function(assert) {
  assert.expect(1);
  return userStore.getUser('testuser')
    .then(function(user) {
      assert.equal(user.userId, 'testuser');
    });
});

QUnit.test('Get user that does not exist', function(assert) {
  assert.expect(1);

  // TODO: I found no better way then using catch here.
  // Catch is bad because it could be some other error (e.g. syntax error) and
  // then we would wrongly assume the test succeeded AND we also loose the
  // stack trace of the error.
  // We do an explicit check of the error message now, so we can be sure
  // it's the right error. However that's not really ideal. Better would be using
  // assert.throws but that is not compatible with promises it seems.
  return userStore.getUser('userx').catch(function(err) {
    assert.equal(err.message, 'No user found for userId userx', 'Should be user not found error');
  });
});

QUnit.test('Create a new user', function(assert) {
  assert.expect(2);
  return userStore.createUser({email: 'test2@example.com'})
    .then(function(user) {
      assert.ok(user.userId, 'New user should have a userId');
      assert.equal(user.email, 'test2@example.com', 'email should be "test2@example.com"');
    });
});

QUnit.test('Create a new user that already exists', function(assert) {
  // TODO: again we need to use catch (see explanation above)
  assert.expect(1);
  return userStore.createUser({userId: 'testuser'})
    .catch(function(err) {
      assert.equal(err.message, 'User already exists', 'Should throw the right error');
    });
});

QUnit.test('Create a new user with existing email', function(assert) {
  return userStore.createUser({'email': 'test@example.com'})
    .catch(function(err) {
      // TODO: we should be more restrictive here. We receive a SQLConstraint error
      // however we should throw something custom that does not reveal our DB layout
      // console.log(err);
      assert.ok(err, 'Creating a new user with existing email should error');
    });
});

QUnit.test('Update a user record', function(assert) {
  assert.expect(1);
  return userStore.updateUser('testuser', {'name': 'voodoo'})
    .then(function(user) {
      assert.equal(user.name, 'voodoo', 'user name should be "voodoo"');
      return userStore.getUser('testuser');
    });
});

QUnit.test('Update email of a user record', function(assert) {
  assert.expect(2);
  return userStore.updateUser('testuser', {'email': 'other@email.com'}).then(function(user) {
    assert.equal(user.email, 'other@email.com');
    return userStore.getUserByEmail('test@example.com').catch(function(err) {
      assert.ok(err, 'Email test@example.com should no longer exist');
    });
  });
});

QUnit.test('Remove a user record', function(assert) {
  assert.expect(2);
  return userStore.deleteUser('testuser')
    .then(function(user) {
      assert.equal(user.userId, 'testuser', 'Deleted user record should be returned');
      return userStore.userExists('testuser');
    }).then(function(exists) {
      assert.notOk(exists, 'testuser should no longer exist.');
    });
});
