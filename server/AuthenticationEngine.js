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
  this.requestLoginUrl = function(req, res, next) {
    var args = req.body; // has email and docId (optional) which should be included in the login url.

    // TODO: Daniel, implement,
    // if no user exists we create the user
    // how can we test this?
  };

  /*
    Authenticate based on either sessionToken
  */
  this.authenticate = function(loginData, cb) {
    // console.log('POST: /hub/api/authenticate');
    var loginData = req.body;

    if (loginData.loginKey) {
      this._authenticateWithLoginKey(loginData.loginKey, cb);
    } else {
      this._authenticateWithToken(loginData.sessionToken, cb);
    }
  };

  /*
    Creates a new user session based on an existing sessionToken

    TODO: Michael implement properly using promises
  */
  this._authenticateWithToken = function(sessionToken, cb) {
    this.sessionStore.getSession(loginData.sessionToken, function(err, session) {
      if (err) return next(err);

      this.sessionStore.deleteSession(session.sessionToken, function(err) {
        if (err) return next(err);
        var newSession = this.createSession({userId: session.userId}, function(err, newSession) {
          if (err) return next(err);
        });
      });
    });
  };

  /*
    Authenicate based on login key

    TODO: Michael implement properly using promises
  */
  this._authenticateWithLoginKey = function(loginKey, cb) {
    var self = this;
    this._getUserByLoginKey(loginKey, function(err, user) {
      if (err) return cb(err);
      self.createSession(user.userId, function(err, session) {
        if (err) return cb(err);
        session.user = user;
        cb(null, session);
      });
    });
  };
};

oo.initClass(AuthenticationEngine);
module.exports = AuthenticationEngine;
