'use strict';

var Collaborators = require('./Collaborators');

module.exports = {
  name: 'collaborators',
  configure: function(config) {
    config.addComponent('collaborators', Collaborators);
    config.addStyle(__dirname, '_collaborators');
  }
};