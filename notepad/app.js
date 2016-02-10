'use strict';

var $ = window.$ = require('substance/util/jquery');
var Component = require('substance/ui/Component');
var CollabSession = require('substance/model/CollabSession');

var Notepad = require('./Notepad');
var Note = require('../note/Note');

var doc = new Note();
var ws = new WebSocket('ws://localhost:5000');
var session = new CollabSession(doc, ws, {
  docId: 'note-1',
  docVersion: 0
});

$(function() {
  // For debugging in the console
  window.doc = doc;
  window.session = session;

  Component.mount(Notepad, {
    documentSession: session,
  }, document.getElementById('editor_container'));
});