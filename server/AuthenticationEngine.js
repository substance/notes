'use strict';

var path = require('path');

/*
  Implements authentication logic
*/
function AuthenticationEngine(config) {
  AuthenticationEngine.super.apply(this, arguments);

  this.userStore = config.userStore;
  this.sessionStore = config.sessionStore;
  this.emailService = config.emailService;
}

AuthenticationEngine.Prototype = function() {

  /*
    Generate new loginKey for user and send email with a link
  */
  this.requestLoginUrl = function(args) {

    // TODO: Daniel, implement,
    // if no user exists we create the user
    // how can we test this?
  };

  /*
    Authenticate based on either sessionToken
  */
  this.authenticate = function(loginData) {
    if (loginData.loginKey) {
      return this._authenticateWithLoginKey(loginData.loginKey);
    } else {
      return this._authenticateWithToken(loginData.sessionToken);
    }
  };

  /*
    Creates a new session based on an existing sessionToken

    1. old session gets read
    2. if exists old session gets deleted 
    3. new session gets created for the same user
    4. rich user object gets attached
  */
  this._authenticateWithToken = function(sessionToken) {
    var sessionStore = this.sessionStore;
    var self = this;

    return new Promise(function(resolve, reject) {
      sessionStore.getSession(sessionToken).then(function(session) {
        // Delete old session
        return sessionStore.deleteSession(session.sessionToken);
      }).then(function(deletedSession) {
        // Create a new session
        return sessionStore.createSession({userId: session.userId});
      }).then(function(newSession) {
        return self._enrichSession(newSession);
      }).then(function(richSession) {
        resolve(richSession);
      }).catch(function(err) {
        reject(err);
      });
    });
  };

  /*
    Attached a full user object to the session record
  */
  this._enrichSession = function(session) {
    var userStore = this.userStore;
    return new Promise(function(resolve, reject) {
      userStore.getUser(session.userId).then(function(user) {
        session.user = user;
        resolve(session);
      }).catch(function(err) {
        reject(err);
      });
    });
  };

  /*
    Authenicate based on login key
  */
  this._authenticateWithLoginKey = function(loginKey) {
    var sessionStore = this.sessionStore;
    var self = this;

    return new Promise(function(resolve, reject) {
      userStore.getUserByLoginKey(loginKey).then(function(user) {
        return this.createSession({userId: session.userId});
      }).then(function(newSession) {
        return self._enrichSession(newSession);
      }).then(function(richSession) {
        resolve(richSession);
      }).catch(function(err) {
        reject(err);
      });
    });
  };
};

oo.initClass(AuthenticationEngine);
module.exports = AuthenticationEngine;
