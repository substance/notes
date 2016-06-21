'use strict';

var SplitPane = require('substance/ui/SplitPane');
var Collaborators = require('../collaborators/Collaborators');
var Notification = require('../notification/Notification');
var Header = require('../header/Header');
var NoteLoader = require('../note-loader/NoteLoader');
var NoteWriter = require('../note-writer/NoteWriter');
var inBrowser = require('substance/util/inBrowser');
var NoteWriterPackage = require('../note-writer/NoteWriterPackage');

function EditNote() {
  NoteLoader.apply(this, arguments);
}

EditNote.Prototype = function() {
  var _super = EditNote.super.prototype;

  this.dispose = function() {
    _super.dispose.call(this);

    if (inBrowser) {
      document.body.classList.remove('sm-fixed-layout');  
    }
  };

  this._updateLayout = function() {
    if (inBrowser) {
      if (this.props.mobile) {
        document.body.classList.remove('sm-fixed-layout');
      } else {
        document.body.classList.add('sm-fixed-layout');  
      }
    }
  };

  this.render = function($$) {
    var notification = this.state.notification;
    var el = $$('div').addClass('sc-edit-note');
    var main = $$('div');
    var header;

    this._updateLayout();

    // Configure header
    // --------------

    header = $$(Header, {
      mobile: this.props.mobile,
      actions: {
        'home': 'My Notes',
        'newNote': 'New Note'
      }
    });

    // Notification overrules collaborators
    if (notification) {
      header.outlet('content').append(
        $$(Notification, notification)
      );
    } else if (this.state.session) {
      header.outlet('content').append(
        $$(Collaborators, {
          session: this.state.session
        })
      );
    }

    // Main content
    // --------------

    // Display top-level errors. E.g. when a doc could not be loaded
    // we will display the notification on top level
    if (this.state.error) {
      main = $$('div').append(
        $$(Notification, {
          type: 'error',
          message: this.state.error.message
        })
      );
    } else if (this.state.session) {
      var fileClient = this.context.fileClient;
      main = $$(NoteWriter, {
        configurator: this.props.configurator,
        noteInfo: this.state.noteInfo,
        documentSession: this.state.session,
        onUploadFile: fileClient.uploadFile.bind(fileClient)
      }).ref('notepad');
    }

    el.append(
      $$(SplitPane, {splitType: 'horizontal'}).append(
        header,
        main
      ).ref('splitPane')
    );
    return el;
  };


  this._onCollabClientDisconnected = function() {
    this.extendState({
      notification: {
        type: 'error',
        message: 'Connection lost! After reconnecting, your changes will be saved.'
      }
    });
  };

  this._onCollabClientConnected = function() {
    this.extendState({
      notification: null
    });
  };

  /*
    Extract error message for error object. Also consider first cause.
  */
  this._onCollabSessionError = function(err) {
    var message = [
      this.i18n.t(err.name)
    ];
    if (err.cause) {
      message.push(this.i18n.t(err.cause.name));
    }
    this.extendState({
      notification: {
        type: 'error',
        message: message.join(' ')
      }
    });
  };

  this._onCollabSessionSync = function() {
    if (this.state.notification) {
      // Unset notification (error message)
      this.extendState({
        notification: null
      });
    }
  };
};

NoteLoader.extend(EditNote);

module.exports = EditNote;