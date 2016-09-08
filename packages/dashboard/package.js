'use strict';

var Dashboard = require('./Dashboard');

module.exports = {
  name: 'dashboard',
  configure: function(config) {
    config.addComponent('dashboard', Dashboard);
    config.addStyle(__dirname, '_dashboard');
    config.addStyle(__dirname, '_note-item');
  }
};