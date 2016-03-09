'use strict';

var oo = require('substance/util/oo');
var map = require('lodash/map');
var Knex = require('knex');
var knexConfig = require('../knexfile');
var env = process.env.NODE_ENV || 'development';

/*
  Implements Substance Store API. This is just a stub and is used for
  testing.
*/
function UserStore() {
  this.connect();
}

UserStore.Prototype = function() {

  /*
    Connect to the db
  */
  this.connect = function() {
    this.config = knexConfig[env];
    if (!this.config) {
      throw new Error('Could not find config for environment', env);
    }
    this.db = new Knex(this.config);
  };

  /*
    Disconnect from the db and shut down
  */
  this.shutdown = function(cb) {
    this.db.destroy(cb);
  };

  /*
    Create a new user record (aka signup)

    @param {Object} userData JSON object
    @param {Function} cb callback
  */
  this.createUser = function(userData) {
    var self = this;

    return this._userExists(userData.userId)
      .then(function(exists){
        if(exists) throw new Error('User already exists');
        return self._createUser(userData);
      }).catch(function(error) {
        console.error(error);
      });
    // return this._userExists(userData.userId, function(err, exists) {
    //   if(err) return cb(err);
    //   if(exists) return cb(new Error('User already exists'));
    //   self._createUser(userData, cb);
    // });
  };

  /*
    Get user record for a given userId

    @param {String} userId user id
    @param {Function} cb callback
  */
  this.getUser = function(userId) {
    var query = this.db('users')
                .where('userId', userId);

    return query
      .then(function(user) {
        if (user.length === 0) {
          throw new Error('No user found for userId ' + userId);
        }
        user = user[0];
        user.userId = user.userId.toString();
        return user;
      }).catch(function(error) {
        console.error(error);
      });
  };

  this.updateUser = function(userId, props) {

  };

  /*
    Get user record for a given loginKey
  */
  this._getUserByLoginKey = function(loginKey, cb) {
    var query = this.db('users')
                .where('loginKey', loginKey);

    query.asCallback(function(err, user) {
      if (err) return cb(err);
      user = user[0]; // query result is an array
      if (!user) return cb(new Error('Your provided login key was invalid.'));
      cb(null, user);
    });
  };

  /*
    Internal method to create a user entry
  */
  this._createUser = function(userData) {
    // at some point we should make this more secure
    var loginKey = userData.loginKey || uuid();
    var user = {
      name: userData.name,
      email: userData.email,
      createdAt: Date.now(),
      loginKey: loginKey
    };

    return this.db.table('users').insert(user)
      .then(function(userIds) {
        user.userId = userIds[0];
        return user;
      }).catch(function(error) {
        console.error(error);
      });
  };

  /*
    Check if user exists
  */
  this._userExists = function(id) {
    var query = this.db('users')
                .where('userId', id)
                .limit(1);

    return query.then(function(user) {
      if(user.length === 0) return false;
      return true;
    });

    // query.asCallback(function(err, user) {
    //   if (err) return cb(err);
    //    return cb(null, false);
    //   cb(null, true);
    // });
  };

  /*
    Run migrations

    @param {Function} cb callback
  */
  this.resetDB = function() {
    var self = this;

    return self.db.schema
      .dropTableIfExists('changes')
      .dropTableIfExists('documents')
      .dropTableIfExists('sessions')
      .dropTableIfExists('users')
      // We should drop migrations table 
      // to rerun the same migration again
      .dropTableIfExists('knex_migrations')
      .then(function() {
        return self.db.migrate.latest(self.config);
      }).catch(function(error) {
        console.error(error);
      });
  };

  /*
    Resets the database and loads a given seed object

    Be careful with running this in production

    @param {Object} seed JSON object
    @param {Function} cb callback
  */
  this.seed = function(seed) {
    var self = this;
    var actions = map(seed, self.createUser.bind(self));

    return Promise.all(actions);
  };

};

oo.initClass(UserStore);

module.exports = UserStore;
