'use strict';

var oo = require('substance/util/oo');
var Knex = require('knex');
var knexConfig = require('../knexfile');
var env = process.env.NODE_ENV || 'development';

/*
  Implements Substance Store API. This is just a stub and is used for
  testing.
*/
function UserStore(config) {
  UserStore.super.apply(this, arguments);
  this.config = config;
  this.connect();
}

UserStore.Prototype = function() {

  /*
    Connect to the db
  */
  this.connect = function() {
    var config = knexConfig[env];
    if (!config) {
      throw new Error('Could not find config for environment', env);
    }
    this.db = new Knex(config);
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

  /*
    Run migrations

    @param {Function} cb callback
  */
  this.runMigration = function(cb) {
    this.db.migrate.latest({directory: './db/migrations'}).asCallback(function(err){
      if(err) return cb(err);
      cb(null);
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

    self.runMigration.call(self, function() {
      each(seed, function(user){
        self.createUser(user, function(){
          console.log('blah');
        });
      });
    });
  };

};

oo.initClass(UserStore);

module.exports = UserStore;
