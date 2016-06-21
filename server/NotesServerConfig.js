'use strict';

var config = require('config');
var extend = require('lodash/extend');
var NotePackage = require('../packages/note/NotePackage');
var ServerConfig = extend({}, config.get('server'), {env: config.util.getEnv('NODE_ENV')});

module.exports = {
  name: 'notes-server',
  configure: function(config) {
    config.import(NotePackage);
    config.setAppConfig(ServerConfig);
  }
};