'use strict';

var uuid = require('substance/util/uuid');

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
  this.requestLoginLink = function(args) {
    var userStore = this.userStore;
    userStore.getUserbyEmail(args.email)
      .catch(function(err) {
        // User does not exist, we create a new one
        return userStore.createUser({email: args.email});
      }).then(function(user) {
        return this._sendLoginLink(user);
      });
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
    Generates a new login key for a given email
  */
  this._updateLoginKey = function(user) {
    var userStore = this.userStore;
    return userStore.getUserbyEmail(user.email).then(function(user) {
      var newLoginKey = uuid();
      return userStore.updateUser(user.userId, {loginKey: newLoginKey});
    }).then(function(updatedUser) {
  };

  /*
    Send a login link via email
  */
  this._sendLoginLink = function(user) {
    return new Promise(function(resolve, reject) {
      // TODO: send email instead
      console.log('YOUR NEW LOGIN KEY IS ', user.loginKey);
      resolve();
    });
  }

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
