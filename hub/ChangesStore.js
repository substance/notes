"use strict";

var connect = require('./connect');
var EventEmitter = require('substance/util/EventEmitter');
var _ = require('substance/util/helpers');
var uuid = require('substance/util/uuid');

// TODO: we should move that into the real database
var USERS = {
  'demo': {
    'userId': 'demo',
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
  */
  this.getChanges = function(id, sinceVersion, cb) {
    // cb(null, changes, headVersion);
    var self = this;
    var query = this.db('changes')
                .select('data', 'id')
                .where('changeset', id)
                .andWhere('pos', '>=', sinceVersion)
                .orderBy('pos', 'asc');

    query.asCallback(function(err, changes) {
      if (err) return cb(err);
      // console.log('changes', changes);
      changes = _.map(changes, function(c) {return JSON.parse(c.data); });
      self.getVersion(id, function(err, headVersion) {
        return cb(null, headVersion, changes);
      });
    });
  };

  /*
    Add a change to a changeset. Implicitly creates a new changeset
    when the first change is added to
    @param {String} id changeset id
    @param {Object} change as JSON object
  */
  this.addChange = function(id, change, cb) {
    var self = this;
    var user = 'substance bot';

    this.getVersion(id, function(err, headVersion) {
      if (err) return cb(err);
      var version = headVersion + 1;
      var record = {
        id: id + '/' + version,
        changeset: id,
        pos: version,
        data: JSON.stringify(change),
        timestamp: Date.now(),
        user: user
      };

      self.db.table('changes').insert(record)
        .asCallback(function(err) {
          if (err) return cb(err);
          cb(null, version);
        });
    });
  };

  /*
    Gets the version number for a document
  */
  this.getVersion = function(id, cb) {
    // HINT: version = count of changes
    // 0 changes: version = 0
    // 1 change:  version = 1
    var query = this.db('changes')
                .where('changeset', id)
                .count();
    query.asCallback(function(err, count) {
      if (err) return cb(err);
      return cb(null, count[0]['count(*)']);
    });
  };

  /*
    Removes a changeset from the db
    @param {String} id changeset id
  */
  this.deleteChangeset = function(id, cb) {
    var query = this.db('changes')
                .where('changeset', id)
                .del();
    query.asCallback(function(err) {
      return cb(err);
    });
  };

  /*
    Get user record for a given userId
  */
  this.getUser = function(userId, cb) {
    cb(null, USERS[userId]);
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

  this.getSession = function(sessionToken, cb) {
    cb(null, SESSIONS[sessionToken]);
  };

};

EventEmitter.extend(ChangesStore);

module.exports = ChangesStore;