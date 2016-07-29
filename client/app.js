'use strict';

var substanceGlobals = require('substance/util/substanceGlobals');
substanceGlobals.DEBUG_RENDERING = true;

var Notes = require('../packages/notes/Notes');
var NotesConfigurator = require('../packages/notes/NotesConfigurator');
var NotesPackage = require('./package');
var configurator = new NotesConfigurator().import(NotesPackage);

window.onload = function() {
  window.app = Notes.static.mount({
    configurator: configurator
  }, document.body);
};