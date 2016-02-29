'use strict';

var _ = require('substance/util/helpers');
var $ = window.$ = require('substance/util/jquery');
var Component = require('substance/ui/Component');
var $$ = Component.$$;
var HubClient = require('substance/collab/HubClient');
var Router = require('substance/ui/Router');
var Notepad = require('./Notepad');
var Login = require('./Login');
var Dashboard = require('./Dashboard');
var Welcome = require('./Welcome');

var I18n = require('substance/ui/i18n');
I18n.instance.load(require('./i18n/en'));

function App() {
  Component.apply(this, arguments);

  // EXPERIMENTAL: with server.serveHTML it is now possible to
  // provide dynamic configuration information via HTML meta tags
  // TODO: we want this to go into a Substance util helper
  var config = {};
  var metaTags = window.document.querySelectorAll('meta');

  _.each(metaTags, function(tag) {
    var name = tag.getAttribute('name');
    var content = tag.getAttribute('content');
    if (name && content) {
      config[name] = content;
    }
  });

  var host = config.host || 'localhost';
  var port = config.port || 5000;
  
  // We need to maintain some extra private/internal state in addition to
  // this.state, which is used for routing
  this._state = {
    initialized: false,
    authenticated: false
  };

  // Initialize hubClient
  this.hubClient = new HubClient({
    wsUrl: config.wsUrl || 'ws://'+host+':'+port,
    httpUrl: config.httpUrl || 'http://'+host+':'+port
  });
  
  this.handleActions({
    'openNote': this._openNote,
    'authenticated': this._authenticated,
    'logout': this._logout
  });
}

App.Prototype = function() {

  // Life cycle
  // ------------------------------------

  /*
    Router initialization
  */
  this.getInitialContext = function() {
    return {
      router: new Router(this)
    };
  };

  /*
    Expose hubClient to all child components
  */
  this.getChildContext = function() {
    return {
      hubClient: this.hubClient
    };
  };

  /*
    That's the public state reflected in the route
  */
  this.getInitialState = function() {
    return {
      mode: 'index'
    };
  };

  /*
    Handle result of initial authenticate
  */
  this._authenticateDone = function(err, userSession) {
    if (err) {
      window.localStorage.removeItem('sessionToken');
    } else {
      this._setSessionToken(userSession.sessionToken);
    }

    this.extendInternalState({
      initialized: true,
      error: err,
      authenticated: !err
    });
  };

  /*
    Attempt to reauthenticate based on last used session token
  */
  this._init = function() {
    var loginKey = this.state.loginKey;
    var storedToken = this._getSessionToken();
    var loginData;

    if (loginKey) {
      loginData = {loginKey: loginKey};
    } else if (storedToken) {
      loginData = {sessionToken: storedToken};
    }
    
    if (loginData) {
      this.hubClient.authenticate(loginData, this._authenticateDone.bind(this));
    } else {
      this.extendInternalState({initialized: true});
    }
  };

  this.didMount = function() {
    this._init();
  };

  /*
    Nothing to do here, as app is always running
  */
  this.dispose = function() {

  };

  // Action Handlers
  // ------------------------------------

  /*
    Open an existing note
  */
  this._openNote = function(docId) {
    this.extendState({
      mode: 'edit',
      docId: docId
    });
  };

  /*
    Forget current user session
  */
  this._logout = function() {
    this.hubClient.logout();
    this.extendInternalState({
      authenticated: false
    });
  };

  /*
    Handles action triggered by Login component
  */
  this._authenticated = function(userSession) {
    this._setSessionToken(userSession.sessionToken);
    this.extendInternalState({
      authenticated: true
    });
  };


  // Rendering
  // ------------------------------------

  this.render = function() {
    var el = $$('div').addClass('sc-app');
    
    // TODO: Create error component (popup)
    if (this._state.error) {
      el.append($$('div').addClass('se-error').append(
        this._state.error.message
      ));
    }

    // Just render empty div during initialization phase
    if (!this._state.initialized) {
      return el;
    }

    // Just render the login form if not authenticated
    if (this.state.mode === 'edit' && !this._state.authenticated) {
      el.append($$(Login).ref('login'));
      return el;
    }

    switch(this.state.mode) {
      case 'index':
        if (this._state.authenticated) {
          el.append($$(Dashboard).ref('dashboard'));
        } else {
          el.append($$(Welcome).ref('welcome'));
        }
        break;
      case 'edit':
        el.append($$(Notepad, {
          docId: this.state.docId
        }).ref('notepad'));
        break;
      default:
        console.error('Unsupported mode', this.state.mode);
    }
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

  /*
    We need to maintain some extra private/internal state
  */
  this.extendInternalState = function(obj) {
    Object.assign(this._state, obj);
    this.rerender();
  };
};

Component.extend(App);

// Start the application
$(function() {
  window.app = Component.mount(App, document.body);
});
