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
  var wsUrl = config.wsUrl || 'ws://'+host+':'+port;
  console.log('WebSocket-URL:', wsUrl);
  this.ws = new WebSocket(wsUrl);
}

App.Prototype = function() {

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

  this.didMount = function() {
    if (this.state.mode === 'edit') {
      this._initSession();
    }
  };

  // E.g. if a different document is opened
  this.didUpdateState = function() {
    if (this.state.mode === 'edit') {
      this._initSession();
    }
  };

  this._initSession = function() {
    console.log('App._initSession');
    if (this.session) {
      this.session.dispose();
    }

    this.doc = new Note();
    this.session = new CollabSession(doc, this.ws, {
      docId: this.state.docId,
      docVersion: 0
    });

    window.doc = this.doc;
    window.session = this.session;

    // TODO: Use on('started') instead.
    this.session.on('connected', this._onSessionStarted, this);
  };

  this._onSessionStarted = function() {
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
      if (this.session && this.session.isRunning()) {
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