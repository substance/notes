'use strict';

var Configurator = require('substance/util/Configurator');

function NotesServerConfigurator() {
  NotesServerConfigurator.super.apply(this, arguments);
}

NotesServerConfigurator.Prototype = function() {

  this.setAppConfig = function(config) {
    this.config.app = config;
  };

  this.getAppConfig = function() {
    return this.config.app;
  };

}

Configurator.extend(NotesServerConfigurator);

module.exports = NotesServerConfigurator;