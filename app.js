window.SUBSTANCE_DEBUG_RENDERING = true;

var NotesApp = require('./client/NotesApp');
var Component = require('substance/ui/Component');
var $ = window.$ = require('substance/util/jquery');

// Start the application
$(function() {
  window.app = Component.mount(NotesApp, document.body);
});
