"use strict";

var connect = require('./connect');
var EventEmitter = require('substance/util/EventEmitter');
var _ = require('substance/util/helpers');
var uuid = require('substance/util/uuid');

// TODO: we should move that into the real database
var USERS = {
  'demo': {
    'id': 'demo',
    'password': 'demo',
    'name': 'Demo user'
  }
};

// TODO: store sessions in a real db table
var SESSIONS = {

};

/*
  Implements Substance Store API. This is just a stub and is used for
  testing.
*/
function ChangesStore(knex) {
  this.db = connect(knex.config);
  ChangesStore.super.apply(this);
}

ChangesStore.Prototype = function() {

  /*
    Gets changes from the DB.

    @param {String} id changeset id
    @param {String} sinceVersion changes since version (0 = all changes, 1 all except first change)
    @return
  */
  this.getChanges = function(id, sinceVersion) {
    // cb(null, changes, headVersion);
    var self = this;
    var query = this.db('changes')
                .select('data', 'id')
                .where('changeset', id)
                .andWhere('pos', '>=', sinceVersion)
                .orderBy('pos', 'asc');

    return new Promise(function(resolve, reject) {
      query.asCallback(function(err, changes) {
        if (err) return reject(err);
        // console.log('changes', changes);
        changes = _.map(changes, function(c) {return JSON.parse(c.data); });

        self.getVersion(id).then(function(headVersion) {
          resolve({
            version: headVersion,
            changes: changes
          });
        }, reject);
      });
    });
  };

  /*
    Add a change to a changeset. Implicitly creates a new changeset
    when the first change is added to

    @param {String} id changeset id
    @param {String} change change represented as JSON object
  */
  this.addChange = function(id, change) {
    var self = this;
    var user = 'substance bot';

    return new Promise(function(resolve, reject) {
      self.getVersion(id).then(function(headVersion) {
        var newVersion = headVersion + 1;
        var record = {
          id: id + '/' + newVersion,
          changeset: id,
          pos: newVersion,
          data: JSON.stringify(change),
          timestamp: Date.now(),
          user: user
        };

        self.db.table('changes').insert(record)
          .asCallback(function(err) {
            if (err) return reject(err);
            resolve(newVersion);
          });
      }, reject);
    });
  };

  /*
    Gets the version number for a document
  */
  this.getVersion = function(id) {
    // HINT: version = count of changes
    // 0 changes: version = 0
    // 1 change:  version = 1
    var query = this.db('changes')
                .where('changeset', id)
                .count();

    return new Promise(function(resolve, reject) {
      query.asCallback(function(err, count) {
        if (err) return reject(err);
        resolve(count[0]['count(*)']);
      });
    });
  };

  /*
    Removes a changeset from the db

    @param {String} id changeset id
  */
  this.deleteChangeset = function(id) {
    var query = this.db('changes')
                .where('changeset', id)
                .del();

    return new Promise(function(resolve, reject) {
      query.asCallback(function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });      
    });
  };

  this.getUser = function(userId) {
    return new Promise(function(resolve) {
      resolve(USERS[userId]);
    });
  };

  /*
    Checks given login data and creates an entry in the session store for valid logins
    Returns a user record and a session token
  */
  this.createSession = function(loginData) {
    return new Promise(function(resolve, reject) {
      var user = USERS[loginData.login];
      if (user && loginData.password === user.password) {
        var newSession = {
          sessionToken: uuid(),
          user: user
        };
        // TODO: In a real db we must store only the userId not the whole
        // user record
        SESSIONS[newSession.sessionToken] = newSession;
        resolve(newSession);
      } else {
        reject(new Error('Invalid login'));
      }
    });
  };

  this.deleteSession = function(/*sessionToken*/) {
    // TODO: implement
  };

  this.getSession = function(sessionToken) {
    return new Promise(function(resolve) {
      resolve(SESSIONS[sessionToken]);
    });
  };

};

EventEmitter.extend(ChangesStore);

module.exports = ChangesStore;