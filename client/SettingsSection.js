'use strict';

var Component = require('substance/ui/Component');
var EnterName = require('./EnterName');

function SettingsSection() {
  Component.apply(this, arguments);
}

SettingsSection.Prototype = function() {
  this.render = function($$) {
    var el = $$('div').addClass('sc-index-section').append(
      $$(EnterName, this.props)
    );
    return el;
  };
};

Component.extend(SettingsSection);

module.exports = SettingsSection;