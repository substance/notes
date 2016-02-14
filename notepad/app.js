'use strict';

var _ = require('substance/util/helpers');
var $ = window.$ = require('substance/util/jquery');
var Component = require('substance/ui/Component');
var $$ = Component.$$;
var CollabSession = require('substance/model/CollabSession');
var Router = require('substance/ui/Router');
var Notepad = require('./Notepad');
var Note = require('../note/Note');

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
  this.wsUrl = config.wsUrl || 'ws://'+host+':'+port;
  this._initWebSocket();
}

App.Prototype = function() {

  this._initWebSocket = function() {
    console.log('Starting websocket connection:', this.wsUrl);

    this.ws = new WebSocket(this.wsUrl);
    window.ws = this.ws;
    this.ws.onopen = this._onWebSocketOpen.bind(this);

    this.ws.onclose = function() {
      console.log('websocket connection closed. Attempting to reconnect in 5s.');
      setTimeout(function() {
        this._initWebSocket();
      }.bind(this), 5000);
    }.bind(this);
  };

  this._onWebSocketOpen = function() {
    console.log('websocket connection is open.');
    this._initSession();
  };

  this.getInitialContext = function() {
    return {
      router: new Router(this)
    };
  };

  this.getInitialState = function() {
    return {
      mode: 'index'
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
          this.session._dispose();
        }

        this.doc = new Note();
        this.session = new CollabSession(this.doc, {
          docId: this.state.docId,
          docVersion: 0
        });

        window.doc = this.doc;
        window.session = this.session;

        // Now we connect the session to the remote end point and wait until the
        // 'opened' event has been fired. Then the doc is ready for editing
        this.session.open(this.ws);
        this.session.on('opened', this._onSessionOpened, this);
      } else if (this.session && this.state.docId === this.session.doc.id) {
        // This happens on reconnect (when websocket got closed and new connection was opened)
        this.session.open(this.ws);
        this.session.on('opened', this._onSessionOpened, this);
      }
    }
  };

  this._onSessionOpened = function() {
    // Now it's time to render the editor
    this.rerender();
  };

  /*
    Creates a new note and opens it for editing
  */
  this.newNote = function() {
    // Just open the existing note
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

    if (this.state.mode === 'edit') {
      if (this.session && this.session.isOpen()) {
        el.append($$(Notepad, {documentSession: this.session}));        
      } else {
        el.append('Loading document...');
      }
    } else {
      el.append(
        $$('div').append('Substance Notepad is real-time collaborative notes editor.'),
        $$('button').addClass('se-new-note').on('click', this.newNote).append('New Note')
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