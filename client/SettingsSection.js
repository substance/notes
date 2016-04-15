'use strict';

var Component = require('substance/ui/Component');

function SettingsSection() {
  Component.apply(this, arguments);
}

SettingsSection.Prototype = function() {
  this.render = function($$) {
    var el = $$('div').addClass('sc-index-section').append('SETTINGS SECTION');
    return el;
  };
};

Component.extend(SettingsSection);

module.exports = SettingsSection;