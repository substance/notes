"use strict";

var connect = require('./connect');
var EventEmitter = require('substance/util/EventEmitter');
var _ = require('substance/util/helpers');
var uuid = require('substance/util/uuid');

// TODO: we should move that into the real database
var USERS = {
  1: {
    'userId': 1,
    'loginKey': '1234',
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
    Create a new user record (aka signup)

    @param {Object} userData contains name property
  */
  this.createUser = function(userData, cb) {
    var loginKey = uuid(); // at some point we should make this more secure
    var newUser = {
      userId: 2, // TODO: use incremental id from postgres.
      name: userData.name,
      createdAt: new Date(),
      loginKey: loginKey
    };

    var newSession = {
      sessionToken: uuid(),
      user: newUser
    };
    
    SESSIONS[newSession.sessionToken] = newSession;
    // Return new session and loginKey
    cb(null, {
      session: newSession,
      loginKey: loginKey
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
  this.createSession = function(loginData, cb) {
    // this is hardcoded for the demo. you need to lookup the user table based on 
    // loginData.loginKey, if you find an entry then you return that user entry
    // if no entry is found the loginKey was wrong and you return an error
    var user = USERS[1];
    console.log('USER', user); 

    if (user && loginData.loginKey === user.loginKey) {
      var newSession = {
        sessionToken: uuid(),
        user: user
      };
      // TODO: In a real db we must store only the userId not the whole
      // user record. However as a response we still want the full user
      // object there
      SESSIONS[newSession.sessionToken] = newSession;
      cb(null, newSession);
    } else {
      cb(new Error('Invalid login'));
    }
  };

  this.deleteSession = function(/*sessionToken*/) {
    // Actually we don't need this really. Instead we
    // need a maintenance operation that deletes expired sessions.
  };

  this.getSession = function(sessionToken, cb) {
    // TODO: this must get the session from the db based on sessionToken
    // then you also need to fetch the user associated with that session
    // to return it
    // format must be:
    // {
    //   sessionToken: '...',
    //   user: {} // object contains user record
    // }
    cb(null, SESSIONS[sessionToken]);
  };

};

EventEmitter.extend(ChangesStore);

module.exports = ChangesStore;