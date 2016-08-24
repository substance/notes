'use strict';

var oo = require('substance/util/oo');
var map = require('lodash/map');
var uuid = require('substance/util/uuid');
var Err = require('substance/util/SubstanceError');
var isUndefined = require('lodash/isUndefined');
var Promise = require('bluebird');

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
    @returns {Promise}
  */
  this.createUser = function(userData) {
    // Generate a userId if not provided
    if (!userData.userId) {
      userData.userId = uuid();
    }

    if (isUndefined(userData.name)) {
      userData.name = '';
    }

    return this.userExists(userData.userId).bind(this)
      .then(function(exists) {
        if (exists) {
          throw new Err('UserStore.CreateError', {
            message: 'User already exists.'
          });
        }

        return this._createUser(userData);
      }.bind(this));
  };

  /*
    Get user record for a given userId

    @param {String} userId user id
    @returns {Promise}
  */
  this.getUser = function(userId) {
    return new Promise(function(resolve, reject) {
      this.db.users.findOne({user_id: userId}, function(err, user) {
        if (err) {
          return reject(new Err('UserStore.ReadError', {
            cause: err
          }));
        }

        if (!user) {
          return reject(new Err('UserStore.ReadError', {
            message: 'No user found for userId ' + userId
          }));
        }

        user.userId = user.user_id;

        resolve(user);
      });
    }.bind(this));
  };

  /*
    Update a user record with given props

    @param {String} userId user id
    @param {Object} props properties to update
    @returns {Promise}
  */
  this.updateUser = function(userId, props) {
    return this.userExists(userId).bind(this)
      .then(function(exists) {
        if (!exists) {
          throw new Err('UserStore.UpdateError', {
            message: 'User with user_id ' + userId + ' does not exists'
          });
        }

        return new Promise(function(resolve, reject) {
          var userData = props;
          userData.user_id = userId;

          this.db.users.save(userData, function(err, user) {
            if (err) {
              return reject(new Err('UserStore.UpdateError', {
                cause: err
              }));
            }

            resolve(user);
          });
        }.bind(this));
      }.bind(this));
  };

  /*
    Remove a user from the db

    @param {String} userId user id
    @returns {Promise}
  */
  this.deleteUser = function(userId) {
    return this.userExists(userId).bind(this)
      .then(function(exists) {
        if (!exists) {
          throw new Err('UserStore.DeleteError', {
            message: 'User with user_id ' + userId + ' does not exists'
          });
        }

        return new Promise(function(resolve, reject) {
          this.db.users.destroy({user_id: userId}, function(err, user) {
            if (err) {
              return reject(new Err('UserStore.DeleteError', {
                cause: err
              }));
            }
            user = user[0];

            // map user_id to userId
            user.userId = user.user_id;

            resolve(user);
          });
        }.bind(this));
      }.bind(this));
  };

  /*
    Get user record for a given loginKey

    @param {String} loginKey login key
    @returns {Promise}
  */
  this.getUserByLoginKey = function(loginKey) {
    return new Promise(function(resolve, reject) {
      this.db.users.findOne({login_key: loginKey}, function(err, user) {
        if (err) {
          return reject(new Err('UserStore.ReadError', {
            cause: err
          }));
        }

        if (!user) {
          return reject(new Err('UserStore.ReadError', {
            message: 'No user found for provided loginKey'
          }));
        }

        // map user_id to userId
        user.userId = user.user_id;

        resolve(user);
      });
    }.bind(this));
  };

  /*
    Get user record for a given email

    @param {String} email user email
    @returns {Promise}
  */
  this.getUserByEmail = function(email) {
    return new Promise(function(resolve, reject) {
      this.db.users.findOne({email: email}, function(err, user) {
        if (err) {
          return reject(new Err('UserStore.ReadError', {
            cause: err
          }));
        }

        if (!user) {
          return reject(new Err('UserStore.ReadError', {
            message: 'No user found with email ' + email
          }));
        }

        resolve(user);
      });
    }.bind(this));
  };

  /*
    Internal method to create a user entry

    @param {Object} userData JSON object
    @returns {Promise}
  */
  this._createUser = function(userData) {
    // at some point we should make this more secure
    var loginKey = userData.loginKey || uuid();

    var record = {
      user_id: userData.userId,
      name: userData.name,
      email: userData.email,
      created: new Date(),
      login_key: loginKey
    };

    return new Promise(function(resolve, reject) {
      this.db.users.insert(record, function(err, user) {
        if (err) {
          return reject(new Err('UserStore.CreateError', {
            cause: err
          }));
        }

        // map user_id to userId
        user.userId = user.user_id;

        resolve(user);
      });
    }.bind(this));
  };

  /*
    Check if user exists

    @param {String} userId user id
    @returns {Promise}
  */
  this.userExists = function(userId) {
    return new Promise(function(resolve, reject) {
      this.db.users.findOne({user_id: userId}, function(err, user) {
        if (err) {
          return reject(new Err('UserStore.ReadError', {
            cause: err
          }));
        }
        resolve(!isUndefined(user));
      });
    }.bind(this));
  };

  /*
    List available users

    @param {Object} filters filters
    @param {Object} options options (limit, offset, fields)
    @returns {Promise}
  */
  this.listUsers = function(filters, options) {
    // Default limit to avoid unlimited listing
    if(!options.limit) options.limit = 100;

    return new Promise(function(resolve, reject) {
      this.db.users.find(filters, options, function(err, users) {
        if (err) {
          return reject(new Err('UserStore.ListError', {
            cause: err
          }));
        }

        resolve(users);
      });
    }.bind(this));
  };

  /*
    Count available users
    
    @param {Object} filters filters
    @returns {Promise}
  */
  this.countUsers = function(filters) {
    return new Promise(function(resolve, reject) {
      this.db.users.count(filters, function(err, count) {
        if (err) {
          return reject(new Err('UserStore.CountError', {
            cause: err
          }));
        }

        resolve(count);
      });
    }.bind(this));
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
