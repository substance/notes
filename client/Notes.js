'use strict';

var _ = require('substance/util/helpers');
var Component = require('substance/ui/Component');
var $$ = Component.$$;
var AuthenticationClient = require('./AuthenticationClient');
var DocumentClient = require('substance/collab/DocumentClient');
var Router = require('substance/ui/Router');
var EditNote = require('./EditNote');
var Dashboard = require('./Dashboard');
var Welcome = require('./Welcome');

var I18n = require('substance/ui/i18n');
I18n.instance.load(require('../i18n/en'));

function Notes() {
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

  config.host = config.host || 'localhost';
  config.port = config.port || 5000;
  
  // We need to maintain some extra private/internal state in addition to
  // this.state, which is used for routing
  this._state = {
    initialized: false,
    error: null,
    authenticated: false
  };

  // Store config for later use (e.g. in child components)
  this.config = config;

  this.authenticationClient = new AuthenticationClient({
    httpUrl: config.authenticationServerUrl || 'http://'+config.host+':'+config.port+'/api/auth/'
  });

  this.documentClient = new DocumentClient({
    httpUrl: config.documentServerUrl || 'http://'+config.host+':'+config.port+'/api/documents/'
  });
  
  this.handleActions({
    'openNote': this._openNote,
    'newNote': this._newNote,
    'openDashboard': this._openDashboard,
    'logout': this._logout
  });
}

Notes.Prototype = function() {

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
      authenticationClient: this.authenticationClient,
      documentClient: this.documentClient,
      config: this.config
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
      this.authenticationClient.authenticate(loginData, this._authenticateDone.bind(this));
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
    Create a new note
  */
  this._newNote = function() {
    // console.log('NEW NOTE', docId);
    var userId = this._getUserId();
    this.documentClient.createDocument({
      schemaName: 'substance-note',
      // TODO: Find a way not to do this statically
      info: {
        title: 'Untitled',
        userId: userId
      }
    }, function(err, result) {
      this.extendState({
        mode: 'edit',
        docId: result.documentId
      });
      // console.log('doc created', err, result);
    }.bind(this));

  };

  /*
    Open a dashboard
  */
  this._openDashboard = function() {
    this.extendState({
      mode: 'index',
      docId: ''
    });
  };

  /*
    Forget current user session
  */
  this._logout = function() {
    this.authenticationClient.logout();
    this.extendInternalState({
      authenticated: false
    });
  };


  // Rendering
  // ------------------------------------

  this.render = function() {
    var el = $$('div').addClass('sc-app');
    
    // TODO: Create error component (popup)
    if (this._state.error) {
      el.append($$('div').addClass('se-error').append(
        this._state.error.message,
        $$('span').addClass('se-dismiss').append('Dismiss')
      ));
    }

    // Just render empty div during initialization phase
    if (!this._state.initialized) {
      return el;
    }

    // Just render the login form if not authenticated
    if (this.state.mode === 'edit' && !this._state.authenticated) {
      // We just show the welcome screen here for now
      el.append($$(Welcome).ref('welcome'));
      return el;
    }

    switch (this.state.mode) {
      case 'edit':
        el.append($$(EditNote, {
          docId: this.state.docId
        }).ref('editNote'));
        // HACK: add the sm-fixed layout class, so the body does not scroll
        document.body.classList.add('sm-fixed-layout');
        break;
      default: // mode=index or default
        // HACK: removes the sm-fixed layout class so the body element gets scrollable
        document.body.classList.remove('sm-fixed-layout');
        if (this._state.authenticated) {
          el.append($$(Dashboard).ref('dashboard'));
        } else {
          el.append($$(Welcome).ref('welcome'));
        }
        break;
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

  this._getUserId = function() {
    var authenticationClient = this.authenticationClient;
    var user = authenticationClient.getUser();
    return user.userId;
  };

  /*
    We need to maintain some extra private/internal state
  */
  this.extendInternalState = function(obj) {
    Object.assign(this._state, obj);
    this.rerender();
  };
};

Component.extend(Notes);

module.exports = Notes;
