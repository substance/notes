'use strict';

var NotesPackage = require('../packages/notes/NotesPackage');
var AuthenticationClient = require('./AuthenticationClient');
var DocumentClient = require('./DocumentClient');
var FileClient = require('./FileClient');

var appConfig = {
  port: 5000,
  host: "localhost"
};

module.exports = {
  name: 'notes-app',
  configure: function(config) {
    config.import(NotesPackage);

    config.setAppConfig({
      port: appConfig.port,
      host: appConfig.host
    });

    // Define Authentication Client
    config.setAuthenticationServerUrl('http://'+appConfig.host+':'+appConfig.port+'/api/auth/');
    config.setAuthenticationClient(AuthenticationClient);
    // Define Document Client
    config.setDocumentServerUrl('http://'+appConfig.host+':'+appConfig.port+'/api/documents/');
    config.setDocumentClient(DocumentClient);
    // Define File Client
    config.setFileServerUrl('http://'+appConfig.host+':'+appConfig.port+'/api/files/');
    config.setFileClient(FileClient);
  }
};