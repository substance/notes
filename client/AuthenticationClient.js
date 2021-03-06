'use strict';

var oo = require('substance/util/oo');
var $ = require('substance/util/jquery');

/*
  HTTP client for talking with AuthenticationServer
*/

function AuthenticationClient(config) {
  this.config = config;
  this._requests = {};
}

AuthenticationClient.Prototype = function() {

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

  this.changeName = function(userId, name, cb) {
    this._requests['changeName'] = userId+name;

    var path = this.config.httpUrl + 'changename';
    this._request('POST', path, {
      userId: userId,
      name: name
    }, function(err, res) {
      // Skip if there has been another request in the meanwhile
      if (this._requestInvalid('changeName', userId+name)) return;

      if (err) return cb(err);
      // We need to update user.name locally too
      this._session.user.name = name;
      cb(null, res);
    }.bind(this));
  };

  /*
    Returns true if client is authenticated
  */
  this.isAuthenticated = function() {
    return !!this._session;
  };

  this._requestInvalid = function(reqName, reqParams) {
    return this._requests[reqName] !==  reqParams;
  };

  /*
    Authenticate user

    Logindata consists of an object (usually with login/password properties)
  */
  this.authenticate = function(loginData, cb) {
    this._requests['authenticate'] = loginData;

    var path = this.config.httpUrl + 'authenticate';
    this._request('POST', path, loginData, function(err, hubSession) {
      // Skip if there has been another request in the meanwhile
      if (this._requestInvalid('authenticate', loginData)) return;

      if (err) return cb(err);
      this._session = hubSession;
      cb(null, hubSession);
    }.bind(this));
  };

  /*
    Clear user session

    TODO: this should make a logout call to the API to remove the session entry
  */
  this.logout = function(cb) {
    this._session = null;
    cb(null);
  };

  /*
    Request a login link for a given email address
  */
  this.requestLoginLink = function(data, cb) {
    this._requests['requestLoginLink'] = data;

    var path = this.config.httpUrl + 'loginlink';
    this._request('POST', path, data, function(err, res) {
      // Skip if there has been another request in the meanwhile
      if (this._requestInvalid('requestLoginLink', data)) return;
      if (err) return cb(err);
      cb(null, res);
    }.bind(this));
  };

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

};

oo.initClass(AuthenticationClient);

module.exports = AuthenticationClient;
