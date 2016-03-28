var CollabSession = require('substance/collab/CollabSession');
var JSONConverter = require('substance/model/JSONConverter');
var Note = require('../model/Note');
var Collaborators = require('./Collaborators');
var CollabClient = require('substance/collab/CollabClient');
var WebSocketConnection = require('substance/collab/WebSocketConnection');
var Notification = require('./Notification');
var Header = require('./Header');
var converter = new JSONConverter();
var NoteWriter = require('./NoteWriter');
var Component = require('substance/ui/Component');
var $$ = Component.$$;

function EditNote() {
  Component.apply(this, arguments);
  
  var config = this.context.config;
  var authenticationClient = this.context.authenticationClient;

  this.conn = new WebSocketConnection({
    wsUrl: config.wsUrl || 'ws://'+config.host+':'+config.port
  });

  this.collabClient = new CollabClient({
    connection: this.conn,
    enhanceMessage: function(message) {
      message.sessionToken = authenticationClient.getSessionToken();
      return message;
    }.bind(this)
  });

  this.collabClient.on('disconnected', this._onCollabClientDisconnected, this);
  this.collabClient.on('connected', this._onCollabClientConnected, this);
}

EditNote.Prototype = function() {

  this.getInitialState = function() {
    return {
      session: null, // CollabSession will be stored here, if null indicates we are in loading state
      error: null, // used to display error messages e.g. loading of document failed
      notification: null //used to display status messages in topbar
    };
  };

  // Life cycle
  // ------------------------------------

  this.didMount = function() {
    this._loadDocument();
  };

  this.willReceiveProps = function() {
    this.dispose();
    // TODO: This is a bit bad taste. but we need to reset to initial
    // state if we are looking at a different document.
    this.state = this.getInitialState();
  };

  this.didReceiveProps = function() {
    this._loadDocument();
  };

  this.dispose = function() {
    if (this.state.session) {
      this.state.session.dispose();
    }
    this.collabClient.off(this);
  };

  this._onCollabClientDisconnected = function() {
    console.log('disconnected');
    this.extendState({
      notification: {
        type: 'error',
        message: 'Connection lost! After reconnecting, your changes will be saved.'
      }
    });
  };

  this._onCollabClientConnected = function() {
    console.log('connected');
    this.extendState({
      notification: null
    });
  };

  // Life cycle
  // ------------------------------------

  this.render = function() {
    var notification = this.state.notification;
    var el = $$('div').addClass('sc-notepad-wrapper');


    // Configure header
    // --------------

    var header = $$(Header);

    header.outlet('actions').append(
      $$('button').addClass('se-action').append('Dashboard').on('click', this.send.bind(this, 'openDashboard')),
      $$('button').addClass('se-action').append('New Note').on('click', this.send.bind(this, 'newNote'))
    );

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
    el.append(header);


    // Main content
    // --------------

    // Display top-level errors. E.g. when a doc could not be loaded
    // we will display the notification on top level
    if (this.state.error) {
      el.append($$(Notification, {
        type: 'error',
        message: this.state.error.message
      }));
    } else if (this.state.session) {
      el.append(
        $$(NoteWriter, {
          documentSession: this.state.session,
          // onUploadFile: hubClient.uploadFile
        }).ref('notepad')
      );
    } else {
      el.append($$(Notification, {
        type: 'info',
        message: 'Loading document...'
      }));
    }
    return el;
  };

  // Helpers
  // ------------------------------------

  /*
    Display a message in topbar
    status consists of type (error/warning/success/info),
    message and optional dissmiss param (number of seconds until dismiss)
  */
  // this.setStatus = function(status) {
  //   var self = this;
  //   this.extendState({
  //     status: status
  //   });
  //   if(status.dismiss > 0) {
  //     setTimeout(function(){
  //       self.dismissStatus();
  //     }, 1000*status.dismiss);
  //   }
  // };

  /*
    Removes status message
  */
  this.dismissStatus = function() {
    this.extendState({
      status: null
    });
  };

  /*
    Loads a document and initializes a CollabSession
  */
  this._loadDocument = function() {
    var collabClient = this.collabClient;
    var documentClient = this.context.documentClient;
    
    documentClient.getDocument(this.props.docId, function(err, docRecord) {
      if (err) {
        this.setState({
          notification: {
            type: 'error',
            message: 'Document could not be loaded.'
          }
        });
        console.error('ERROR', err);
        return;
      }
      
      var doc = new Note();
      doc = converter.importDocument(doc, docRecord.data);
      var session = new CollabSession(doc, {
        documentId: this.props.docId,
        version: docRecord.version,
        collabClient: collabClient
      });

      // HACK: For debugging purposes
      window.doc = doc;
      window.session = session;

      setTimeout(function() {
        this.extendState({
          session: session
        });
      }.bind(this), 1000);
    }.bind(this));
  };
};

Component.extend(EditNote);

module.exports = EditNote;