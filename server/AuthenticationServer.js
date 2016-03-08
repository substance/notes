'use strict';

var oo = require('substance/util/oo');

/*
  Implements a simple AuthenticationServer we may want to
  reuse for other Substance projects.
*/
function AuthenticationServer(config) {
  AuthenticationServer.super.apply(this, arguments);
  this.engine = config.authenticationEngine;
}

AuthenticationServer.Prototype = function() {

  /*
    Attach this server to an express instance

    @param {String} mountPath must be something like '/api/auth/'
  */
  this.mount = function(mountPath, app) {
    app.post(mountPath + 'login', this._requestLoginUrl.bind(this));
    app.post(mountPath + 'authenticate', this._authenticate.bind(this));
  };

  /*
    Generate new loginKey for user and send email with a link
  */
  this._requestLoginUrl = function(req, res, next) {
    var args = req.body; // has email and docId (optional) which should be included in the login url.

    this.engine.requestLoginurl(args).then(function(result) {
      res.json(result);
    }).catch(function(err) {
      return next(err);
    });
  };

  /*
    Authenticate based on either sessionToken
  */
  this._authenticate = function(req, res, next) {
    var loginData = req.body;

    this.engine.authenticate(loginData).then(function(session) {
      res.json(session);
    }).catch(function(err) {
      return next(err);
    });
  };
};

oo.initClass(AuthenticationServer);
module.exports = AuthenticationServer;
