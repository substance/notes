'use strict';

var each = require('lodash/each');
var inBrowser = require('substance/util/inBrowser');
var DefaultDOMElement = require('substance/ui/DefaultDOMElement');
var Component = require('substance/ui/Component');
var DocumentClient = require('substance/collab/DocumentClient');
var AuthenticationClient = require('./AuthenticationClient');
var FileClient = require('./FileClient');
var EditNote = require('./EditNote');
var Dashboard = require('./Dashboard');
var Profile = require('./Profile');
var Welcome = require('./Welcome');
var NotesRouter = require('./NotesRouter');

var I18n = require('substance/ui/i18n');
I18n.instance.load(require('../i18n/en'));

function Notes() {
  Component.apply(this, arguments);

  // EXPERIMENTAL: with server.serveHTML it is now possible to
  // provide dynamic configuration information via HTML meta tags
  // TODO: we want this to go into a Substance util helper
  var config = {};
  var metaTags = window.document.querySelectorAll('meta');

  each(metaTags, function(tag) {
    var name = tag.getAttribute('name');
    var content = tag.getAttribute('content');
    if (name && content) {
      config[name] = content;
    }
  });

  config.host = config.host || 'localhost';
  config.port = config.port || 5000;

  // Store config for later use (e.g. in child components)
  this.config = config;

  this.authenticationClient = new AuthenticationClient({
    httpUrl: config.authenticationServerUrl || 'http://'+config.host+':'+config.port+'/api/auth/'
  });

  this.documentClient = new DocumentClient({
    httpUrl: config.documentServerUrl || 'http://'+config.host+':'+config.port+'/api/documents/'
  });

  this.fileClient = new FileClient({
    httpUrl: config.fileServerUrl || 'http://'+config.host+':'+config.port+'/api/files/'
  });

  this.handleActions({
    'openNote': this._openNote,
    'newNote': this._newNote,
    'openDashboard': this._openDashboard,
    'openUserSettings': this._openUserSettings,
    'logout': this._logout
  });

  this.router = new NotesRouter(this);
}

Notes.Prototype = function() {

  // var _super = Notes.super.prototype;

  // Life cycle
  // ------------------------------------

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

  /*
    That's the public state reflected in the route
  */
  this.getInitialState = function() {
    return {
      mode: 'index',
      initialized: false,
      authenticated: false,
      error: null,
      mobile: this._isMobile()
    };
  };

  this.didMount = function() {
    if (inBrowser) {
      var _window = DefaultDOMElement.getBrowserWindow();
      _window.on('resize', this._onResize, this);
    }
    this.router.readURL();
  };

  this.didUpdate = function() {
    if (!this.state.initialized) {
      console.log('initializing..');
      this._init();
    }
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
      this.extendState({initialized: true});
    }
  };

  /*
    Nothing to do here, as app is always running
  */
  this.dispose = function() {
    this.ws.removeEventListener('resize', this._onResize);
    if (inBrowser) {
      var _window = DefaultDOMElement.getBrowserWindow();
      _window.off(this);
    }
  };

  // Rendering
  // ------------------------------------

  this.render = function($$) {
    var el = $$('div').addClass('sc-app');
    if (this.state.error) {
      el.append($$('div').addClass('se-error').append(
        this.state.error.message,
        $$('span').addClass('se-dismiss').append('Dismiss')
      ));
    }

    // FIXME: don't manipulate document.body here.
    // You can reset it in willRender()
    // and set it in didRender()
    // Make sure to guard it with `if (inBrowser) {}`

    // Reset CSS on body element
    document.body.classList.remove('sm-fixed-layout');

    // Just render empty div during initialization phase
    if (!this.state.initialized) {
      return el;
    }

    // Just render the login form if not authenticated
    if (this.state.mode === 'edit' && !this.state.authenticated) {
      // We just show the welcome screen here for now
      el.append($$(Welcome).ref('welcome'));
      return el;
    }

    switch (this.state.mode) {
      case 'edit':
        el.append($$(EditNote, {
          mobile: this.state.mobile,
          docId: this.state.docId
        }).ref('editNote'));
        // HACK: add the sm-fixed layout class, so the body does not scroll
        if (!this.state.mobile) {
          document.body.classList.add('sm-fixed-layout');
        }
        break;
      case 'user-settings':
        el.append($$(Profile).ref('profile'));
        break;
      case 'my-notes':
        el.append($$(Dashboard).ref('dashboard'));
        break;
      default: // mode=index or default
        if (this.state.authenticated) {
          var userName = this._getUserName();
          if (userName) {
            el.append($$(Dashboard).ref('dashboard'));
          } else {
            el.append($$(Profile).ref('profile'));
          }
        } else {
          el.append($$(Welcome).ref('welcome'));
        }
        break;
    }
    return el;
  };

  /*
    Handle result of initial authenticate
  */
  this._authenticateDone = function(err, userSession) {
    if (err) {
      return this._logout();
    }
    this._setSessionToken(userSession.sessionToken);
    this.extendState({
      initialized: true,
      authenticated: !err
    });
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

  // Action Handlers
  // ------------------------------------

  /*
    Open an existing note
  */
  this._openNote = function(docId) {
    this.updateState({
      mode: 'edit',
      docId: docId
    });
    // this.router.writeURL();
  };

  this._openUserSettings = function() {
    this.updateState({
      mode: 'user-settings'
    });
    // this.router.writeURL();
  };

  /*
    Create a new note
  */
  this._newNote = function() {
    var userId = this._getUserId();
    this.documentClient.createDocument({
      schemaName: 'substance-note',
      // TODO: Find a way not to do this statically
      info: {
        title: 'Untitled',
        userId: userId
      }
    }, function(err, result) {
      this._openNote(result.documentId);
      // console.log('doc created', err, result);
    }.bind(this));
  };

  /*
    Open a dashboard
  */
  this._openDashboard = function() {
    this.updateState({
      mode: 'my-notes'
    });
  };

  /*
    Like setState but keeps several internal properties (initialized, authenticated)

    Also updates the route.
  */
  this.updateState = function(newState, silent) {
    newState.initialized = this.state.initialized;
    newState.authenticated = this.state.authenticated;
    this.setState(newState);
    if (!silent) {
      this.router.writeURL();
    }
  };

  /*
    Forget current user session
  */
  this._logout = function() {
    this.authenticationClient.logout();
    window.localStorage.removeItem('sessionToken');
    this.extendState({
      authenticated: false,
      initialized: true
    });
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

  this._getUserName = function() {
    var authenticationClient = this.authenticationClient;
    var user = authenticationClient.getUser();
    return user.name;
  };

};

Component.extend(Notes);

module.exports = Notes;
