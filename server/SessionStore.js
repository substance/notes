'use strict';

var oo = require('substance/util/oo');
var uuid = require('../util/uuid');

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
  this.createSession = function(userId) {
    var newSession = {
      sessionToken: uuid(),
      timestamp: Date.now(),
      userId: userId
    };

    return this.db.table('sessions').insert(newSession);
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
          throw new Error('No session found for that token');
        }
        session = session[0];
        return session;
      });
  };

  /*
    Remove session entry based with a given session token
  
    TODO: Daniel make deleteSession return the session object one last time
  */
  this.deleteSession = function(sessionToken) {
    var self = this;
    var deletedSession;

    return this._sessionExists
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
      return session;
    });
  };
};

oo.initClass(SessionStore);

module.exports = SessionStore;
