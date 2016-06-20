'use strict';

var extend = require('lodash/extend');
var substanceGlobals = require('substance/util/substanceGlobals');
var inBrowser = require('substance/util/inBrowser');
var DefaultDOMElement = require('substance/ui/DefaultDOMElement');
var Component = require('substance/ui/Component');
var Notes = require('../packages/notes/Notes');
var NotesRouter = require('./NotesRouter');
var NotesConfigurator = require('../packages/notes/NotesConfigurator');
var NotesConfig = require('./NotesConfig');

var configurator = new NotesConfigurator();
configurator.import(NotesConfig);

substanceGlobals.DEBUG_RENDERING = true;

function App() {
  App.super.apply(this, arguments);

  this.authenticationClient = configurator.getAuthenticationClient();
  this.documentClient = configurator.getDocumentClient();
  this.fileClient = configurator.getFileClient();

  this.router = new NotesRouter(this);
  this.router.on('route:changed', this._onRouteChanged, this);

  this.handleActions({
    'navigate': this.navigate
  });
}

App.Prototype = function() {

  /*
    That's the public state reflected in the route
  */
  this.getInitialState = function() {
    return {
      route: undefined,
      userSession: undefined,
      mobile: this._isMobile()
    };
  };

  this.didMount = function() {
    if (inBrowser) {
      var _window = DefaultDOMElement.getBrowserWindow();
      _window.on('resize', this._onResize, this);
    }
    var route = this.router.readRoute();
    // Replaces the current entry without creating new history entry
    // or triggering hashchange
    this.navigate(route, {replace: true});
  };

  this.dispose = function() {
    this.router.off(this);
    this.router.dispose();
  };

  // Life cycle
  // ------------------------------------

  this.__getLoginData = function(route) {
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
    Used to navigate the app based on given route.
  
    Example route: {section: 'note', id: 'note-25'}

    On app level, never use setState/extendState directly as this may
    lead to invalid states.
  */
  this.navigate = function(route, opts) {
    var loginData = this.__getLoginData(route);

    this._authenticate(loginData, function(err, userSession) {
      // Patch route not to include loginKey for security reasons
      delete route.loginKey;

      this.extendState({
        route: route,
        userSession: userSession
      });

      this.router.writeRoute(route, opts);
    }.bind(this));
  };

  /*  
    Authenticate based on loginData object

    Returns current userSession if no loginData is given
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
    Determines when a mobile view should be shown.

    TODO: Check also for user agents. Eg. on iPad we want to show the mobile
    version, even thought he screenwidth may be greater than the threshold.
  */
  this._isMobile = function() {
    return window.innerWidth < 700;
  };

  this._onResize = function() {
    if (this._isMobile()) {
      // switch to mobile
      if (!this.state.mobile) {
        this.extendState({
          mobile: true
        });
      }
    } else {
      if (this.state.mobile) {
        this.extendState({
          mobile: false
        });
      }
    }
  };

  /*
    Expose hubClient to all child components
  */
  this.getChildContext = function() {
    return {
      authenticationClient: this.authenticationClient,
      documentClient: this.documentClient,
      fileClient: this.fileClient,
      config: this.config,
      urlHelper: this.router
    };
  };



  // Rendering
  // ------------------------------------

  this.render = function($$) {
    var el = $$('div').append(
      $$(Notes, extend({}, this.state, {configurator: configurator})).ref('notes')
    );

    return el;
  };

  // Helpers
  // ------------------------------------

  /*
    Store session token in localStorage
  */
  this._setSessionToken = function(sessionToken) {
    console.log('storing new sessionToken', sessionToken);
    window.localStorage.setItem('sessionToken', sessionToken);
  };

  /*
    Retrieve last session token from localStorage
  */
  this._getSessionToken = function() {
    return window.localStorage.getItem('sessionToken');
  };

  this._userSessionUpdated = function(userSession) {
    console.log('user session updated');
    this.extendState({
      userSession: userSession
    });

    if (this.state.route && this.state.route.section === 'settings') {
      this.navigate({section: 'index'});
    }
  };

  this._onRouteChanged = function(route) {
    console.log('NotesApp._onRouteChanged', route);
    this.navigate(route, {replace: true});
  };

};

Component.extend(App);

window.onload = function() {
  window.app = App.static.mount(document.body);
};