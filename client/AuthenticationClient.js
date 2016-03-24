"use strict";

var oo = require('substance/util/oo');
var $ = require('substance/util/jquery');

/*
  HTTP client for talking with AuthenticationServer
*/

function AuthenticationClient(config) {
  this.config = config;
}

AuthenticationClient.Prototype = function() {

  /*
    A generic request method
  */
  this._request = function(method, url, data, cb) {
    var ajaxOpts = {
      type: method,
      url: url,
      contentType: "application/json; charset=UTF-8",
      dataType: "json",
      success: function(data) {
        cb(null, data);
      },
      error: function(err) {
        // console.error(err);
        cb(new Error(err.responseJSON.errorMessage));
      }
    };
    if (data) {
      ajaxOpts.data = JSON.stringify(data);
    }
    $.ajax(ajaxOpts);
  };

  this.getSession = function() {
    return this._session;
  };

  this.getSessionToken = function() {
    if (this._session) {
      return this._session.sessionToken;
    } else return null;
  };

  this.getUser = function() {
    if (this._session) {
      return this._session.user;
    } else return null;
  };

  /*
    Returns true if client is authenticated
  */
  this.isAuthenticated = function() {
    return !!this._session;
  };

  /*
    Authenticate user

    Logindata consists of an object (usually with login/password properties)
  */
  this.authenticate = function(loginData, cb) {
    this._request('POST', this.config.httpUrl + 'authenticate', loginData, function(err, hubSession) {
      if (err) return cb(err);
      this._session = hubSession;
      cb(null, hubSession);
    }.bind(this));
  };

  /*
    Clear user session

    TODO: this should make a logout call to the API to remove the session entry
  */
  this.logout = function() {
    this._session = null;
  };

  /*
    Request a login link for a given email address
  */
  this.requestLoginLink = function(email, cb) {
    this._request('POST', this.config.httpUrl + 'loginlink', {email: email}, function(err, res) {
      if (err) return cb(err);
      cb(null, res);
    }.bind(this));
  };

};

oo.initClass(AuthenticationClient);

module.exports = AuthenticationClient;
