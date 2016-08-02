'use strict';

var substanceTest = require('substance/test/test').module('server/UserStore');

var Database = require('../../server/Database');
var UserStore = require('../../server/UserStore');

var db, userStore;

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

test('Get user', function(t) {
  t.plan(1);
  return userStore.getUser('testuser')
    .then(function(user) {
      t.equal(user.userId, 'testuser');
    });
});

test('Get user that does not exist', function(t) {
  t.plan(1);

  // TODO: I found no better way then using catch here.
  // Catch is bad because it could be some other error (e.g. syntax error) and
  // then we would wrongly assume the test succeeded AND we also loose the
  // stack trace of the error.
  // We do an explicit check of the error message now, so we can be sure
  // it's the right error. However that's not really ideal. Better would be using
  // t.throws but that is not compatible with promises it seems.
  return userStore.getUser('userx').catch(function(err) {
    t.equal(err.message, 'No user found for userId userx', 'Should be user not found error');
  });
});

test('Create a new user', function(t) {
  t.plan(2);
  return userStore.createUser({email: 'test2@example.com'})
    .then(function(user) {
      t.isNotNil(user.userId, 'New user should have a userId');
      t.equal(user.email, 'test2@example.com', 'email should be "test2@example.com"');
    });
});

test('Create a new user that already exists', function(t) {
  // TODO: again we need to use catch (see explanation above)
  t.plan(1);
  return userStore.createUser({userId: 'testuser'})
    .catch(function(err) {
      t.equal(err.name, 'UserStore.CreateError', 'Should throw the right error');
    });
});

test('Create a new user with existing email', function(t) {
  return userStore.createUser({'email': 'test@example.com'})
    .catch(function(err) {
      // TODO: we should be more restrictive here. We receive a SQLConstraint error
      // however we should throw something custom that does not reveal our DB layout
      // console.log(err);
      t.isNotNil(err, 'Creating a new user with existing email should error');
      t.end();
    });
});

test('Update a user record', function(t) {
  t.plan(1);
  return userStore.updateUser('testuser', {'name': 'voodoo'})
    .then(function(user) {
      t.equal(user.name, 'voodoo', 'user name should be "voodoo"');
      return userStore.getUser('testuser');
    });
});

test('Update email of a user record', function(t) {
  t.plan(2);
  return userStore.updateUser('testuser', {'email': 'other@email.com'}).then(function(user) {
    t.equal(user.email, 'other@email.com');
    return userStore.getUserByEmail('test@example.com').catch(function(err) {
      t.isNotNil(err, 'Email test@example.com should no longer exist');
    });
  });
});

test('Remove a user record', function(t) {
  t.plan(2);
  return userStore.deleteUser('testuser')
    .then(function(user) {
      t.equal(user.userId, 'testuser', 'Deleted user record should be returned');
      return userStore.userExists('testuser');
    }).then(function(exists) {
      t.notOk(exists, 'testuser should no longer exist.');
    });
});