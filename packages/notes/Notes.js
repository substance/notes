'use strict';

var AbstractApplication = require('../common/AbstractApplication');
var NotesRouter = require('./NotesRouter');

/*
  Notes Application component.
*/
function Notes() {
  Notes.super.apply(this, arguments);

  var configurator = this.props.configurator;

  this.config = configurator.getAppConfig();
  this.configurator = configurator;
  this.authenticationClient = configurator.getAuthenticationClient();
  this.documentClient = configurator.getDocumentClient();
  this.fileClient = configurator.getFileClient();
  this.componentRegistry = configurator.getComponentRegistry();
  this.iconProvider = configurator.getIconProvider();
  this.labelProvider = configurator.getLabelProvider();

  this.addPage('welcome', this.componentRegistry.get('welcome'));
  this.addPage('dashboard', this.componentRegistry.get('dashboard'));
  this.addPage('settings', this.componentRegistry.get('settings'));
  this.addPage('note', this.componentRegistry.get('note'));

  this.handleActions({
    'dashboard': this._dashboard,
    'settings': this._settings,
    'note': this._note,
    'newNote': this._newNote,
    'deleteNote': this._deleteNote
  });
}

Notes.Prototype = function() {

  this.getChildContext = function() {
    return {
      config: this.config,
      configurator: this.configurator,
      authenticationClient: this.authenticationClient,
      documentClient: this.documentClient,
      fileClient: this.fileClient,
      urlHelper: this.router,
      componentRegistry: this.componentRegistry,
      iconProvider: this.iconProvider,
      labelProvider: this.labelProvider
    };
  };

  this.getDefaultPage = function() {
    return 'dashboard';
  };

  this.getLoginPage = function() {
    return 'welcome';
  };

  this.getRouter = function() {
    return new NotesRouter(this);
  };

  this._onAuthentication = function(route, session) {
    if(!session) {
      if(route.page !== 'note') route.page = 'welcome';
    } else if (!session.user.name) {
      route.page = 'entername';
    }

    return route;
  };

  this._note = function() {
    this.navigate({
      page: 'note'
    });
  };

  this._dashboard = function() {
    this.navigate({
      page: 'dashboard'
    });
  };

  this._settings = function() {
    this.navigate({
      page: 'settings'
    });
  };

  /*
    Create a new note
  */
  this._newNote = function() {
    var userId = this.state.userSession.user.userId;
    this.documentClient.createDocument({
      schemaName: 'substance-note',
      // TODO: Find a way not to do this statically
      // Actually we should not provide the userId
      // from the client here.
      info: {
        title: 'Untitled',
        userId: userId
      }
    }, function(err, result) {
      this.navigate({
        page: 'note',
        documentId: result.documentId
      });
    }.bind(this));
  };

  this._deleteNote = function(documentId) {
    this.documentClient.deleteDocument(documentId, function(/*err, result*/) {
      this._dashboard();
    }.bind(this));
  };
};

AbstractApplication.extend(Notes);

module.exports = Notes;