'use strict';

var _ = require('substance/util/helpers');
var $ = window.$ = require('substance/util/jquery');
var Component = require('substance/ui/Component');
var $$ = Component.$$;
var HubClient = require('substance/collab/HubClient');
var CollabSession = require('substance/collab/CollabSession');
var Router = require('substance/ui/Router');
var Notepad = require('./Notepad');
var Note = require('../note/Note');
var uuid = require('substance/util/uuid');
var Collaborators = require('./Collaborators');
var Login = require('./Login');
var LoginStatus = require('./LoginStatus');

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

  // Initialize hubClient
  this.hubClient = new HubClient({
    wsUrl: config.wsUrl || 'ws://'+host+':'+port,
    httpUrl: config.httpUrl || 'http://'+host+':'+port
  });

  this.hubClient.on('connection', this._onHubClientConnected, this);
  this.hubClient.on('unauthenticate', this._onHubUnauthenticated, this);

  this.handleActions({
    'logout': this._logout
  });
}

App.Prototype = function() {

  this.getInitialContext = function() {
    return {
      router: new Router(this)
    };
  };

  this._onHubClientConnected = function() {
    console.log('hub client is now connected');
    if (this.state.mode === 'edit') {
      this._initCollabSession();
    }
  };

  this._onHubUnauthenticated = function() {
    // Remove user session from localStorage as it's no longer valid
    window.localStorage.removeItem('sessionToken');
    this.rerender();
  };

  /*
    Attempt to reauthenticate based on last used session token
  */
  this._reAuthenticate = function() {
    var token = this._getLastSessionToken();
    if (token) {
      this.hubClient.authenticate({sessionToken: token}, function(err, session) {
        console.log('reauthenticated');
        if (err) {
          console.log('reauthenticate unsuccessful. Removing invalid sessionToken. Login with loginKey required.');
          window.localStorage.removeItem('sessionToken');
        }
        this._onHubAuthenticated(session);
      }.bind(this));      
    }
  };

  /*
    Forget current user session
  */
  this._logout = function() {
    this.hubClient.logout();
  };

  this._onHubAuthenticated = function(userSession) {
    console.log('usersession', userSession);
    this._storeLastSessionToken(userSession.sessionToken);
    if (this.state.mode === 'edit') {
      // Make the transition from authenticated to bringing up the editor
      this._initCollabSession();
    }
    this.rerender();
  };

  this._storeLastSessionToken = function(sessionToken) {
    console.log('storing token', sessionToken);
    window.localStorage.setItem('sessionToken', sessionToken);
  };

  this._getLastSessionToken = function() {
    return window.localStorage.getItem('sessionToken');
  };

  this.getInitialState = function() {
    return {
      mode: 'index'
    };
  };

  this.didMount = function() {
    // Auto-autenticate on page load
    this._reAuthenticate();

    // if (this.state.mode === 'edit' && this.hubClient.isAuthenticated()) {
    //   this._initCollabSession();
    // }
  };

  // E.g. if a different document is opened
  this.didUpdateState = function() {
    if (this.state.mode === 'edit') {
      this._initCollabSession();
    }
  };

  this._initCollabSession = function() {
    console.log('App._initCollabSession');
    
    if (!this.hubClient.isAuthenticated()) {
      console.warn('Tried to init collab session but not authenticated. Skipping.');
      return;
    }
    if (this.state.mode !== 'edit') {
      console.error('Can only create a collab session when we are in edit mode');
      return;
    }
        
    // Either we init the session for the first time or the docId has changed
    if (!this.session || (this.session && this.state.docId !== this.session.doc.id)) {
      
      // We need to dispose the old session first
      if (this.session) {
        this.session.dispose();
      }

      this.doc = new Note();
      this.session = new CollabSession(this.doc, {
        docId: this.state.docId,
        docVersion: 0,
        hubClient: this.hubClient
      });

      console.log('Collabsession created for ', this.state.docId);

      window.doc = this.doc;
      window.session = this.session;

    } else {
      // Just trigger a reopen of the existing session (including pending changes)
      this.session.open();
    }

    // Now we connect the session to the remote end point and wait until the
    // 'opened' event has been fired. Then the doc is ready for editing
    this.session.on('opened', this._onSessionOpened, this);
  };

  this._onSessionOpened = function() {
    // Now it's time to render the editor
    console.log('session opened / or reconnected. Now rerendering editor');
    this.rerender();
  };

  /*
    Creates a new note and opens it for editing
  */
  this.newNote = function() {
    var newNoteId = uuid();
    this.openNote(newNoteId);
  };

  /*
    Open the example document 
  */
  this.exampleNote = function() {
    this.openNote('note-1');
  };

  /*
    Open an existing note
  */
  this.openNote = function(docId) {
    this.extendState({
      mode: 'edit',
      docId: docId
    });
  };

  this._renderIntro = function() {
    var el = $$('div').addClass('se-intro').append(
      $$('div').addClass('se-intro-text').html('Substance Notepad is <strong>real-time collaborative</strong> notes editor. 100% open source.')
    );
    return el;
  };

  this._renderDashboard = function() {
    var el = $$('se-dashboard');
    el.append(
      this._renderIntro().append(
        $$('button').addClass('se-new-note').on('click', this.newNote).append('New Note'),
        $$('button').addClass('se-example-note').on('click', this.exampleNote).append('Example Note')
      )
    );
    return el;
  };

  this._renderEditor = function() {
    var el = $$('div').addClass('se-edit-view');

    if (this.session && this.session.isOpen()) {
      el.append(
        $$('div').addClass('se-header').append(
          $$('div').addClass('se-actions').append(
            $$('button').addClass('se-action').append('New Note').on('click', this.newNote)
          ),
          $$(LoginStatus, {
            user: this.hubClient.getUser()
          }),
          $$(Collaborators, {
            session: this.session
          })
        ),
        $$(Notepad, {documentSession: this.session}).ref('notepad')
      );
    } else {
      el.append('Loading document...');
    }
    return el;
  };

  this.render = function() {
    var el = $$('div').addClass('sc-app');

    if (!this.hubClient.isAuthenticated()) {
      el.append(this._renderIntro());

      // Render Login Screen
      el.append($$(Login, {
        hubClient: this.hubClient,
        onAuthenticated: this._onHubAuthenticated.bind(this)
      }));
    } else if (this.state.mode === 'edit') {
      // Render editor
      el.append(this._renderEditor());
    } else {
      el.append(this._renderDashboard());
    }
    return el;
  };
};

Component.extend(App);

// Start the application
$(function() {
  window.app = Component.mount(App, document.body);
});
