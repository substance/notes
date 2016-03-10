'use strict';

var oo = require('substance/util/oo');
var map = require('lodash/map');
var uuid = require('substance/util/uuid');

/*
  A simple SQL Session Store implementation
*/
function SessionStore(config) {
  this.db = config.db.connection;
}

SessionStore.Prototype = function() {

  /*
    Create a session record for a given user

    @param {String} userId user id
  */
  this.createSession = function(session) {
    var newSession = {
      sessionToken: session.sessionToken || uuid(),
      timestamp: Date.now(),
      userId: session.userId
    };

    return this.db.table('sessions').insert(newSession)
      .then(function() {
        return newSession;
      });
  };

  /*
    Get session entry based on a session token

    @param {String} sessionToken session token
  */
  this.getSession = function(sessionToken) {
    var query = this.db('sessions')
                .where('sessionToken', sessionToken);

    return query
      .then(function(session) {
        if (session.length === 0) {
          throw new Error('No session found for token ' + sessionToken);
        }
        session = session[0];
        return session;
      });
  };

  /*
    Remove session entry based with a given session token

    @param {String} sessionToken session token
  */
  this.deleteSession = function(sessionToken) {
    var self = this;
    var deletedSession;

    return this._sessionExists(sessionToken)
      .then(function(session){
        if(!session) throw new Error('Session does not exist');
        deletedSession = session;
        return self.db('sessions')
            .where('sessionToken', sessionToken)
            .del();
      }).then(function(){
        return deletedSession;
      });
  };

  /*
    Check if session exists
  */
  this._sessionExists = function(sessionToken) {
    var query = this.db('sessions')
                .where('sessionToken', sessionToken)
                .limit(1);
    
    return query.then(function(session) {
      if(session.length === 0) return false;
      session = session[0];
      return session;
    });
  };

  /*
    Resets the database and loads a given seed object

    Be careful with running this in production

    @param {Object} seed JSON object
  */
  this.seed = function(seed) {
    var self = this;
    var actions = map(seed, self.createSession.bind(self));

    return Promise.all(actions);
  };
};

oo.initClass(SessionStore);

module.exports = SessionStore;
