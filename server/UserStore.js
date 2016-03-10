'use strict';

var oo = require('substance/util/oo');
var map = require('lodash/map');
var uuid = require('substance/util/uuid');

/*
  Implements Substance Store API. This is just a stub and is used for
  testing.
*/
function UserStore(config) {
  this.db = config.db.connection;
}

UserStore.Prototype = function() {

  /*
    Create a new user record (aka signup)

    @param {Object} userData JSON object
  */
  this.createUser = function(userData) {
    var self = this;

    // Generate a userId if not provided
    if (!userData.userId) {
      userData.userId = uuid();
    }

    return this.userExists(userData.userId)
      .then(function(exists) {
        if (exists) throw new Error('User already exists');
        return self._createUser(userData);
      });
  };

  /*
    Get user record for a given userId

    @param {String} userId user id
  */
  this.getUser = function(userId) {
    var query = this.db('users')
                .where('userId', userId);

    return query.then(function(rows) {
      if (rows.length === 0) {
        throw new Error('No user found for userId ' + userId);
      }
      return rows[0];
    });
  };

  /*
    Update a user record with given props

    @param {String} userId user id
    @param {Object} props properties to update
  */
  this.updateUser = function(userId, props) {
    var self = this;
    var update = this.db('users')
                .where('userId', userId)
                .update(props);

    return update.then(function() {
      return self.getUser(userId);
    });
  };

  /*
    Remove a user from the db

    @param {String} userId user id
  */
  this.deleteUser = function(userId) {
    var self = this;
    var del = this.db('users')
                .where('userId', userId)
                .del();
    
    
    // We fetch the user record before we delete it
    return self.getUser(userId).then(function(user) {
      return del.then(function() {
        return user;
      });
    });
  };

  /*
    Get user record for a given loginKey

    @param {String} loginKey login key
  */
  this.getUserByLoginKey = function(loginKey) {
    var query = this.db('users')
                .where('loginKey', loginKey);

    return query
      .then(function(user) {
        if (user.length === 0) {
          throw new Error('No user found for provided loginKey.');
        }
        user = user[0];
        return user;
      });
  };

  /*
    Get user record for a given email

    @param {String} email user email
  */
  this.getUserByEmail = function(email) {
    var query = this.db('users')
                .where('email', email);

    return query
      .then(function(user) {
        if (user.length === 0) {
          throw new Error('There is no user with email ' + email);
        }
        user = user[0];
        return user;
      });
  };

  /*
    Internal method to create a user entry
  */
  this._createUser = function(userData) {
    // at some point we should make this more secure
    var loginKey = userData.loginKey || uuid();

    var user = {
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      createdAt: Date.now(),
      loginKey: loginKey
    };

    return this.db.table('users').insert(user)
      .then(function() {
        // We want to confirm the insert with the created user entry
        return user;
      });
  };

  /*
    Check if user exists
  */
  this.userExists = function(id) {
    var query = this.db('users')
                .where('userId', id)
                .limit(1);

    return query.then(function(user) {
      if (user.length === 0) return false;
      return true;
    });
  };

  /*
    Resets the database and loads a given seed object

    Be careful with running this in production

    @param {Object} seed JSON object
  */
  this.seed = function(seed) {
    var self = this;
    var actions = map(seed, self.createUser.bind(self));
    return Promise.all(actions);
  };

};

oo.initClass(UserStore);

module.exports = UserStore;
