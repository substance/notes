'use strict';

var _ = require('substance/util/helpers');
var $ = window.$ = require('substance/util/jquery');
var Component = require('substance/ui/Component');
var $$ = Component.$$;
var HubClient = require('substance/collab/HubClient');
var forEach = require('lodash/forEach');
var CollabSession = require('substance/collab/CollabSession');
var Router = require('substance/ui/Router');
var Notepad = require('./Notepad');
var Note = require('../note/Note');
var uuid = require('substance/util/uuid');

// This is just for prototyping purposes
var LOGIN_DATA = {
  login: 'demo',
  password: 'demo'
};


function Collaborators() {
  Component.apply(this, arguments);
}

Collaborators.Prototype = function() {

  this.didMount = function() {
    this._init();
  };

  this.willReceiveProps = function() {
    this.dispose();
    this._init();
  };

  this._init = function() {
    this.props.session.on('collaborators:changed', this.rerender, this);
  };

  this.dispose = function() {
    this.props.session.off(this);
  };

  this._extractInitials = function(name) {
    var parts = name.split(' ');
    return parts.map(function(part) {
      return part[0].toUpperCase(); // only use the first letter of a part
    });
  };

  this.render = function() {
    console.log('rerendering');
    var el = $$('div').addClass('se-collaborators');

    var collaborators = this.props.session.collaborators;
    forEach(collaborators, function(collaborator) {
      var initials = this._extractInitials(collaborator.user.name);
      el.append(
        $$('div').addClass('se-collaborator').attr({title: collaborator.user.name}).append(
          initials
        )
      );
    }.bind(this));
    return el;
  };
};


Component.extend(Collaborators);



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

  this.hubClient = new HubClient({
    wsUrl: config.wsUrl || 'ws://'+host+':'+port,
    httpUrl: config.httpUrl || 'http://'+host+':'+port
  });

  this.hubClient.on('connection', this._onHubClientConnected.bind(this));
}

App.Prototype = function() {

  this.getInitialContext = function() {
    return {
      router: new Router(this)
    };
  };

  this._onHubClientConnected = function() {
    console.log('hub client is now connected');
    if (this.state.edit) {
      this._initCollabSession();
    }
  };

  /* Simple authentication */
  this._authenticate = function() {
    console.log('authenticating...');
    this.hubClient.authenticate(LOGIN_DATA, function(err) {
      if (err) {
        return alert('Login failed. Please try again.');
      }
      console.log('your hub session is', this.hubClient.getSession());

      if (this.state.mode === 'edit') {
        // Make the transition from authenticated to bringing up the editor
        this._initCollabSession();
      }
      this.rerender();
    }.bind(this));
  };

  this.getInitialState = function() {
    return {
      mode: 'index'
    };
  };

  this.didMount = function() {
    // Auto-autenticate on page load
    this._authenticate();
  };

  // E.g. if a different document is opened
  this.didUpdateState = function() {
    if (this.state.mode === 'edit') {
      this._initCollabSession();
    }
  };

  this._initCollabSession = function() {
    console.log('App._initCollabSession');
    
    if (!this.hubClient.isAuthenticated()) throw new Error('You have to be authenticated to be able to edit');
    if (this.state.mode !== 'edit') throw new Error('Can only create a collab session when we are in edit mode');
        
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

      // Now we connect the session to the remote end point and wait until the
      // 'opened' event has been fired. Then the doc is ready for editing
      this.session.on('opened', this._onSessionOpened, this);
    }
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

  this.openNote = function(docId) {
    this.extendState({
      mode: 'edit',
      docId: docId
    });
  };

  this.render = function() {
    var el = $$('div').addClass('sc-app');

    if (!this.hubClient.isAuthenticated()) {
      el.append(
        $$('button').on('click', this._authenticate).append('Login')
      );
    } else if (this.state.mode === 'edit') {
      if (this.session && this.session.isOpen()) {
        el.append(
          $$('div').addClass('se-edit-view').append(
            $$('div').addClass('se-header').append(
              $$('div').addClass('se-actions').append(
                $$('button').addClass('se-action').append('New Note').on('click', this.newNote)
              ),
              $$(Collaborators, {
                session: this.session
              })
            ),
            $$(Notepad, {documentSession: this.session})
          )
        );
      } else {
        el.append('Loading document...');
      }
    } else {
      el.append(
        $$('div').addClass('se-intro').append(
          $$('div').addClass('se-intro-text').html('Substance Notepad is <strong>real-time collaborative</strong> notes editor. 100% open source.'),
          $$('button').addClass('se-new-note').on('click', this.newNote).append('New Note'),
          $$('button').addClass('se-example-note').on('click', this.exampleNote).append('Example Note')
        )
      );
    }
    return el;
  };
};

Component.extend(App);

// Start the application
$(function() {
  Component.mount(App, document.body);
});
