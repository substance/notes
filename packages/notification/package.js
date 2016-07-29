'use strict';

var Notification = require('./Notification');

module.exports = {
  name: 'notification',
  configure: function(config) {
    config.addComponent('notification', Notification);
    config.addStyle(__dirname, '_notification');
  }
};