'use strict';

var appConfig = require('config');
var uuid = require('substance/util/uuid');
var oo = require('substance/util/oo');
var Err = require('substance/util/Error');
var Mail = require('./Mail');

/*
  Implements authentication logic
*/
function AuthenticationEngine(config) {
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
    return userStore.getUserByEmail(args.email)
      .catch(function() {
        // User does not exist, we create a new one
        return userStore.createUser({email: args.email});
      })
      .then(this._updateLoginKey.bind(this))
      .then(this._sendLoginLink.bind(this));
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

  this.getSession = function(sessionToken) {
    return this.sessionStore.getSession(sessionToken).then(
      this._enrichSession.bind(this)
    );
  };

  this.updateUserName = function(args) {
    var userStore = this.userStore;
    return userStore.updateUser(args.userId, {name: args.name});
  };

  /*
    Generates a new login key for a given email
  */
  this._updateLoginKey = function(user) {
    var userStore = this.userStore;
    var newLoginKey = uuid();
    return userStore.updateUser(user.userId, {loginKey: newLoginKey});
  };

  /*
    Send a login link via email
  */
  this._sendLoginLink = function(user) {
    var url = appConfig.get('server.appUrl');
    var subject = "Welcome to Substance Notes!";
    var msg = "Click the following link to login: " + url + "/#loginKey=" + user.loginKey;
    
    console.log('Message: ', msg);

    return Mail.sendPlain(user.email, subject, msg)
      .then(function(info){
        console.log(info);
        return {
          loginKey: user.loginKey
        };
      }).catch(function(err) {
        throw new Err('AuthenticationEngine.SendLoginLinkError', {
          message: 'invalid-email',
          cause: err
        });
      });
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
      }).then(function(session) {
        // Create a new session
        return sessionStore.createSession({userId: session.userId});
      }).then(function(newSession) {
        return self._enrichSession(newSession);
      }).then(function(richSession) {
        resolve(richSession);
      }).catch(function(err) {
        reject(new Err('AuthenticationEngine.AuthenticateWithTokenError', {
          cause: err
        }));
      });
    });
  };

  /*
    Authenicate based on login key
  */
  this._authenticateWithLoginKey = function(loginKey) {
    var sessionStore = this.sessionStore;
    var userStore = this.userStore;
    var self = this;

    return new Promise(function(resolve, reject) {
      userStore.getUserByLoginKey(loginKey).then(function(user) {
        return sessionStore.createSession({userId: user.userId});
      }).then(function(newSession) {
        return self._enrichSession(newSession);
      }).then(function(richSession) {
        resolve(richSession);
      }).catch(function(err) {
        reject(new Err('AuthenticationEngine.AuthenticateWithLoginKeyError', {
          cause: err
        }));
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
        reject(new Err('AuthenticationEngine.EnrichSessionError', {
          cause: err
        }));
      });
    });
  };
};

oo.initClass(AuthenticationEngine);
module.exports = AuthenticationEngine;
