'use strict';

var Configurator = require('substance/util/Configurator');

function NotesConfigurator() {
  NotesConfigurator.super.apply(this, arguments);
}

NotesConfigurator.Prototype = function() {

  this.setAppConfig = function(config) {
    this.config.app = config;
  };

  this.getAppConfig = function() {
    return this.config.app;
  };

  this.setAuthenticationServerUrl = function(url) {
    this.config.authenticationServerUrl = url;
  };

  this.setDocumentServerUrl = function(url) {
    this.config.documentServerUrl = url;
  };

  this.setFileServerUrl = function(url) {
    this.config.fileServerUrl = url;
  };

  this.setDocumentClient = function(DocumentClientClass) {
    this.config.DocumentClientClass = DocumentClientClass;
  };

  this.getDocumentClient = function() {
    var DocumentClientClass = this.config.DocumentClientClass;
    return new DocumentClientClass({httpUrl: this.config.documentServerUrl});
  };

  this.setAuthenticationClient = function(AuthenticationClientClass) {
    this.config.AuthenticationClientClass = AuthenticationClientClass;
  };

  this.getAuthenticationClient = function() {
    var AuthenticationClientClass = this.config.AuthenticationClientClass;
    return new AuthenticationClientClass({httpUrl: this.config.authenticationServerUrl});
  };

  this.getFileClient = function() {
    var FileClientClass = this.config.fileClient;
    return new FileClientClass({httpUrl: this.config.fileServerUrl});
  };
}

Configurator.extend(NotesConfigurator);

module.exports = NotesConfigurator;