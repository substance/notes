'use strict';

var Header = require('./Header');

module.exports = {
  name: 'header',
  configure: function(config) {
    config.addComponent('header', Header);
    config.addStyle(__dirname, '_header');
  }
};