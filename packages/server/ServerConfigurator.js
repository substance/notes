'use strict';

var Configurator = require('substance/util/Configurator');

function ServerConfigurator() {
  ServerConfigurator.super.apply(this, arguments);
}

ServerConfigurator.Prototype = function() {

  /*
    Set app config
  */
  this.setAppConfig = function(config) {
    this.config.app = config;
  };

  /*
    Get app config
  */
  this.getAppConfig = function() {
    return this.config.app;
  };

  this.addSeed = function(seed) {
    this.config.seed = seed;
  };

  this.getSeed = function() {
    return this.config.seed;
  };

};

Configurator.extend(ServerConfigurator);

module.exports = ServerConfigurator;