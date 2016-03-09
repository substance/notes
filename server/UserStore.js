'use strict';

var oo = require('substance/util/oo');

/*
  Implements Substance Store API. This is just a stub and is used for
  testing.
*/
function UserStore(config) {
  UserStore.super.apply(this, arguments);
  this.config = config;
}

UserStore.Prototype = function() {

  /*
    Create a new user record (aka signup)

    @param {Object} userData JSON object
    @param {Function} cb callback
  */
  this.createUser = function(userData, cb) {
    var self = this;
    
    this._userExists(userData.userId, function(err, exists) {
      if(err) return cb(err);
      if(exists) return cb(new Error('User already exists'));
      self._createUser(userData, cb);
    });
  };

  /*
    Get user record for a given userId

    @param {String} userId user id
    @param {Function} cb callback
  */
  this.getUser = function(userId) {
    var query = this.db('users')
                .where('userId', userId);
    return new Promise(function(resolve, reject) {
      query.then(function(user) {
        if (user.length === 0) {
          reject(new Error('No user found for userId ' + userId));
        }
        user = user[0];
        user.userId = user.userId.toString();
        resolve(user);
      }).catch(function(error) {
        console.error(error);
      });
    });
  };

  /*
    Internal method to create a user entry
  */
  this._createUser = function(userData, cb) {
    // at some point we should make this more secure
    var loginKey = userData.loginKey || uuid();
    var user = {
      name: userData.name,
      email: userData.email,
      createdAt: Date.now(),
      loginKey: loginKey
    };

    this.db.table('users').insert(user)
      .asCallback(function(err, userIds) {
        if (err) return cb(err);
        user.userId = userIds[0];
        cb(null, user);
      });
  };

};

oo.initClass(UserStore);

module.exports = UserStore;
