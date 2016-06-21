'use strict';

var Component = require('substance/ui/Component');
var NoteSection = require('./NoteSection');
var SettingsSection = require('./SettingsSection');
var IndexSection = require('./IndexSection');

/*
  Notes Component
*/
function Notes() {
  Component.apply(this, arguments);

  this.handleActions({
    'newNote': this._newNote,
    'home': this._home,
    'settings': this._settings,
    'deleteNote': this._deleteNote,
    'logout': this._logout,
    'userSessionUpdated': this._userSessionUpdated
  });
};

Notes.Prototype = function() {

  this.render = function($$) {
    var el = $$('div').addClass('sc-notes');

    // Uninitialized
    if (this.props.route === undefined) {
      console.log('Uninitialized');
      return el;
    }
    
    switch (this.props.route.section) {
      case 'note':
        el.append($$(NoteSection, this.props).ref('noteSection'));
        break;
      case 'settings':
        el.append($$(SettingsSection, this.props).ref('settingsSection'));
        break;
      default: // !section || section === index
        el.append($$(IndexSection, this.props).ref('indexSection'));
        break;
    }
    return el;
  };

  // Action Handlers
  // ------------------------------------

  this._home = function() {
    this.send('navigate', {
      section: 'index'
    });
  };

  this._settings = function() {
    this.send('navigate', {
      section: 'settings'
    });
  };

  /*
    Create a new note
  */
  this._newNote = function() {
    var userId = this.props.userSession.user.userId;
    var documentClient = this.context.documentClient;
    documentClient.createDocument({
      schemaName: 'substance-note',
      // TODO: Find a way not to do this statically
      // Actually we should not provide the userId
      // from the client here.
      info: {
        title: 'Untitled',
        userId: userId
      }
    }, function(err, result) {
      this.send('navigate', {
        section: 'note',
        documentId: result.documentId
      });
    }.bind(this));
  };

  this._deleteNote = function(documentId) {
    var documentClient = this.context.documentClient;
    documentClient.deleteDocument(documentId, function(/*err, result*/) {
      this._home();
    }.bind(this));
  };

  /*
    Forget current user session
  */
  this._logout = function() {
    var authenticationClient = this.context.authenticationClient;
    authenticationClient.logout(function(err) {
      if (err) return alert('Logout failed');

      var indexRoute = {};
      window.localStorage.removeItem('sessionToken');
      this.parent.extendState({
        userSession: null,
        route: indexRoute
      });
      this.context.urlHelper.writeRoute(indexRoute);
    }.bind(this));
  };

  this._userSessionUpdated = function(userSession) {
    console.log('user session updated');
    this.parent.extendState({
      userSession: userSession
    });

    if (this.state.route && this.state.route.section === 'settings') {
      this.send('navigate', {section: 'index'});
    }
  };
};

Component.extend(Notes);
module.exports = Notes;