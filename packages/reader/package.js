'use strict';

var Note = require('../note/package');
var ReadNote = require('./ReadNote');
// Base packages
var BasePackage = require('substance/packages/base/BasePackage');
var PersistencePackage = require('substance/packages/persistence/PersistencePackage');

// Notes specific packages
var CoverPackage = require('../cover/package');
var WelcomePackage = require('../welcome/package');

module.exports = {
  name: 'reader',
  configure: function(config) {
    config.addComponent('reader', ReadNote);
    config.addStyle(__dirname, '_reader');

    config.import(Note);
    // Import base packages
    config.import(BasePackage);
    config.import(PersistencePackage);
    // Import notes specific packages
    config.import(WelcomePackage);
    config.import(CoverPackage);
  }
};