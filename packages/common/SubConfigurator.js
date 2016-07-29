'use strict';

var ProseEditorConfigurator = require('substance/packages/prose-editor/ProseEditorConfigurator');

function SubConfigurator() {
  SubConfigurator.super.apply(this, arguments);
}

SubConfigurator.Prototype = function() {

  this.addSeed = function(seed) {
    this.config.seed = seed;
  };

  this.getSeed = function() {
    return this.config.seed;
  };

};

ProseEditorConfigurator.extend(SubConfigurator);

module.exports = SubConfigurator;