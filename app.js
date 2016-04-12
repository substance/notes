var Notes = require('./client/Notes');
var Component = require('substance/ui/Component');
var $ = window.$ = require('substance/util/jquery');

window.SUBSTANCE_DEBUG_RENDERING = true;

// Start the application
$(function() {
  window.app = Component.mount(Notes, document.body);
});