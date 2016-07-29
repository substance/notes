'use strict';

var ResponsiveApplication = require('substance/ui/ResponsiveApplication');
var cloneDeep = require('lodash/cloneDeep');

/*
  Abstract Application class.
*/

function AbstractApplication() {
  AbstractApplication.super.apply(this, arguments);

  this.handleActions({
    'logout': this._logout,
    'userSessionUpdated': this._updateUserSession
  });
}

AbstractApplication.Prototype = function() {

  /*
    Gets default app route.
  */
  this.getDefaultPage = function() {
    throw new Error("This method is abstract.");
  };

  /*
    Gets login route.
  */
  this.getLoginPage = function() {
    throw new Error("This method is abstract.");
  };

  /*
    Gets application router.
  */
  this.getRouter = function() {
    throw new Error("This method is abstract.");
  };

  /*
    Used to navigate the app based on given route.
    Example route: {documentId: '12345'}

    Performs authentication before routing.
  */
  this.navigate = function(route, opts) {
    var loginData = this._getLoginData(route);

    this._authenticate(loginData, function(err, userSession) {
      if (err) {
        console.error(err);
        route = {page: this.getLoginPage()};
      }

      // Patch route not to include loginKey for security reasons
      delete route.loginKey;

      // Call hook to change route depends on userSession properties
      route = this._onAuthentication(route, userSession);

      this.extendState({
        route: route,
        userSession: userSession
      });

      this.router.writeRoute(route, opts);
    }.bind(this));
  };

  this._getPageProps = function() {
    var props = cloneDeep(this.state.route);
    delete props.page;
    props.mobile = this.state.mobile;
    props.userSession = this.state.userSession;
    return props;
  };

  /*  
    Authenticate based on loginData object

    Returns current userSession if no loginData is given.
  */
  this._authenticate = function(loginData, cb) {
    if (!loginData) return cb(null, this.state.userSession);
    this.authenticationClient.authenticate(loginData, function(err, userSession) {
      if (err) {
        window.localStorage.removeItem('sessionToken');
        return cb(err);
      }
      this._setSessionToken(userSession.sessionToken);
      cb(null, userSession);
    }.bind(this));
  };

  /*
    Used for session inspection and returning changed route.
  */
  // eslint-disable-next-line
  this._onAuthentication = function(route, session) {
    // Inspect session here
    return route;
  };

  /*
    Retrieves login data

    Returns login key either session token of logged in user.
  */
  this._getLoginData = function(route) {
    var loginKey = route.loginKey;
    var storedToken = this._getSessionToken();
    var loginData;

    if (loginKey) {
      loginData = {loginKey: loginKey};
    } else if (storedToken && !this.state.userSession) {
      loginData = {sessionToken: storedToken};
    }
    return loginData;
  };

  /*
    Store session token in localStorage.
  */
  this._setSessionToken = function(sessionToken) {
    window.localStorage.setItem('sessionToken', sessionToken);
  };

  /*
    Retrieve last session token from localStorage.
  */
  this._getSessionToken = function() {
    return window.localStorage.getItem('sessionToken');
  };

  /*
    Update user session with new data, for example new user name.
  */
  this._updateUserSession = function(userSession) {
    this.extendState({
      userSession: userSession
    });

    this.navigate({page: this.getDefaultPage()});
  };

  /*
    Logout, e.g. forget current user session.
  */
  this._logout = function() {
    this.authenticationClient.logout(function(err) {
      if (err) throw err;

      window.localStorage.removeItem('sessionToken');
      this.extendState({
        userSession: null
      });
      this.navigate({page: this.getLoginPage()});
    }.bind(this));
  };

};

ResponsiveApplication.extend(AbstractApplication);

module.exports = AbstractApplication;