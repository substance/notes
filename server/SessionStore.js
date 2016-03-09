'use strict';

var oo = require('substance/util/oo');
var matches = require('lodash/matches');
var filter = require('lodash/filter');
var map = require('lodash/map');
var uuid = require('../util/uuid');
var extend = require('lodash/extend');

/*
  A simple SQL Session Store implementation
*/
function SessionStore(config) {
  SessionStore.super.apply(this, arguments);
  this.config = config;
}

SessionStore.Prototype = function() {

  /*
    Create a session record for a given user

    @param {String} userId user id
    @param {Function} cb callback
  */
  this.createSession = function(userId, cb) {
    var newSession = {
      sessionToken: uuid(),
      timestamp: Date.now(),
      userId: userId
    };

    this._createSession(newSession, cb);
  };

  /*
    Get session entry based on a session token

    @param {String} sessionToken session token
    @param {Function} cb callback
  */
  this.getSession = function(sessionToken, cb) {
    var self = this;

    this._getSession(sessionToken, function(err, session) {
      if (err) return cb(err);
      self._getRichSession(session, cb);
    });
  };

  /*
    Remove session entry based with a given session token
  
    TODO: Daniel make deleteSession return the session object one last time
  */
  this.deleteSession = function(sessionToken, cb) {
    var self = this;

    this._sessionExists(sessionToken, function(err) {
      if (err) return cb(err);
      var query = self.db('sessions')
            .where('sessionToken', sessionToken)
            .del();

      query.asCallback(cb);
    });
  };

  /*
    Internal method to get a session record
  */
  this._getSession = function(sessionToken, cb) {
    var query = this.db('sessions')
                .where('sessionToken', sessionToken);

    query.asCallback(function(err, session) {
      if (err) return cb(err);
      session = session[0];
      if (!session) return cb(new Error('No session found for that token'));
      cb(null, session);
    });
  };

  /*
    Check if session exists
  */
  this._sessionExists = function(sessionToken, cb) {
    var query = this.db('sessions')
                .where('sessionToken', sessionToken)
                .limit(1);
    
    query.asCallback(function(err, session) {
      if (err) return cb(err);
      if(session.length === 0) return cb(new Error('Session does not exist'));
      cb(null);
    });
  };
};

oo.initClass(SessionStore);


module.exports = SessionStore;
