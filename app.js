window.SUBSTANCE_DEBUG_RENDERING = true;

var Notes = require('./client/Notes');
var Component = require('substance/ui/Component');
var $ = window.$ = require('substance/util/jquery');

// Start the application
$(function() {
  window.app = Component.mount(Notes, document.body);
});