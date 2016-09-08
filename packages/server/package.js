'use strict';

var config = require('config');
var extend = require('lodash/extend');
var Note = require('../note/package');
var ServerConfig = extend({}, config.get('server'), {env: config.util.getEnv('NODE_ENV')});

module.exports = {
  name: 'server',
  configure: function(config) {
    config.setAppConfig(ServerConfig);
    config.import(Note);
  }
};