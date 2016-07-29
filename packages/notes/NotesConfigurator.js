'use strict';

var Configurator = require('substance/util/Configurator');
var each = require('lodash/each');
var uniq = require('lodash/uniq');

/*
  Top-level configurator for mpro. Has sub-configurators for
  all available modules (editor, viewer etc).
*/
function NotesConfigurator() {
  NotesConfigurator.super.apply(this, arguments);
}

NotesConfigurator.Prototype = function() {

  /*
    Set app config
  */
  this.setAppConfig = function(config) {
    this.config.app = config;
  };

  /*
    Get app config
  */
  this.getAppConfig = function() {
    return this.config.app;
  };

  /*
    Set Authentication Server url
  */
  this.setAuthenticationServerUrl = function(url) {
    this.config.authenticationServerUrl = url;
  };

  /*
    Set Document Server url
  */
  this.setDocumentServerUrl = function(url) {
    this.config.documentServerUrl = url;
  };

  /*
    Set File Server url
  */
  this.setFileServerUrl = function(url) {
    this.config.fileServerUrl = url;
  };

  /*
    Set File Client class
  */
  this.setFileClient = function(fileClient) {
    this.config.fileClient = fileClient;
  };

  /*
    Set Document Client class
  */
  this.setDocumentClient = function(DocumentClientClass) {
    this.config.DocumentClientClass = DocumentClientClass;
  };

  /*
    Get Document Client instance
  */
  this.getDocumentClient = function() {
    var DocumentClientClass = this.config.DocumentClientClass;
    return new DocumentClientClass({httpUrl: this.config.documentServerUrl});
  };

  /*
    Set Authentication Client class
  */
  this.setAuthenticationClient = function(AuthenticationClientClass) {
    this.config.AuthenticationClientClass = AuthenticationClientClass;
  };

  /*
    Get Authentication Client instance
  */
  this.getAuthenticationClient = function() {
    var AuthenticationClientClass = this.config.AuthenticationClientClass;
    return new AuthenticationClientClass({httpUrl: this.config.authenticationServerUrl});
  };

  /*
    Get File Client instance
  */
  this.getFileClient = function() {
    var FileClientClass = this.config.fileClient;
    return new FileClientClass({httpUrl: this.config.fileServerUrl});
  };

  /*
    Provision of sub configurators (e.g. editor, viewer etc
    receive their own configurator)
  */
  this.addConfigurator = function(name, configurator) {
    if (!this.config.configurators) {
      this.config.configurators = {};
    }
    this.config.configurators[name] = configurator;
  };

  /*
    Get sub confgiurator
  */
  this.getConfigurator = function(name) {
    if (!this.config.configurators) {
      return undefined;
    }
    return this.config.configurators[name];
  };

  /*
    Get styles from all configurators
  */
  this.getStyles = function() {
    var styles = [].concat(this.config.styles);

    each(this.config.configurators, function(configurator) {
      styles = styles.concat(configurator.getStyles());
    });

    // Remove duplicates with uniq, since publisher, author,
    // reader use a lot of shared styles
    return uniq(styles);
  };
};

Configurator.extend(NotesConfigurator);

module.exports = NotesConfigurator;