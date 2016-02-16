'use strict';

var _ = require('substance/util/helpers');
var $ = window.$ = require('substance/util/jquery');
var Component = require('substance/ui/Component');
var $$ = Component.$$;
var HubClient = require('substance/util/HubClient');
var CollabSession = require('substance/model/CollabSession');
var Router = require('substance/ui/Router');
var Notepad = require('./Notepad');
var Note = require('../note/Note');
var uuid = require('substance/util/uuid');


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

  this.hubClient.on('connection', function() {
    console.log('hub client is now connected');
    this._initSession();
  }.bind(this));
}

App.Prototype = function() {


  this.getInitialContext = function() {
    return {
      router: new Router(this)
    };
  };

  this._authenticate = function() {
    console.log('authenticating');
  };

  this.getInitialState = function() {
    return {
      mode: 'anauthenticated'
    };
  };

  // E.g. if a different document is opened
  this.didUpdateState = function() {
    if (this.state.mode === 'edit') {
      this._initSession();
    }
  };

  this._initSession = function() {
    console.log('App._initSession');
    if (this.state.mode === 'edit') {
        
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
        // this.session.open(this.ws);
        this.session.on('opened', this._onSessionOpened, this);
      }

      // else if (this.session && this.state.docId === this.session.doc.id) {
      //   // This happens on reconnect (when websocket got closed and new connection was opened)
      //   this.session.open(this.ws);
      //   this.session.on('opened', this._onSessionOpened, this);
      // }
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

    if (this.state.mode === 'unauthenticated') {
      el.append(
        $$('button').on('click', this._authen)
      )
    } else if (this.state.mode === 'edit') {
      if (this.session && this.session.isOpen()) {
        el.append(
          $$('div').addClass('se-edit-view').append(
            $$('div').addClass('se-header').append(
              $$('div').addClass('se-actions').append(
                $$('button').addClass('se-action').append('New Note').on('click', this.newNote)
              ),
              $$('div').addClass('se-collaborators').append(
                $$('div').addClass('se-collaborator').append(
                  $$('img').attr('src', 'https://avatars0.githubusercontent.com/u/2931?v=3&s=460')
                ),
                $$('div').addClass('se-collaborator sm-2').append(
                  $$('img').attr('src', 'https://avatars3.githubusercontent.com/u/284099?v=3&s=460')
                )
              )
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
