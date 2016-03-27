var CollabSession = require('substance/collab/CollabSession');
var JSONConverter = require('substance/model/JSONConverter');
var Note = require('../model/Note');
var Collaborators = require('./Collaborators');
var CollabClient = require('substance/collab/CollabClient');
var WebSocketConnection = require('substance/collab/WebSocketConnection');
var LoginStatus = require('./LoginStatus');
var StatusBar = require('./StatusBar');
var converter = new JSONConverter();
var NoteWriter = require('./NoteWriter');
var Component = require('substance/ui/Component');
var Err = require('substance/util/Error');
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
}

EditNote.Prototype = function() {

  this.getInitialState = function() {
    return {
      session: null, // CollabSession will be stored here, if null indicates we are in loading state
      error: null, // used to display error messages e.g. loading of document failed
      status: null //used to display status messages in topbar
    };
  };

  // Life cycle
  // ------------------------------------

  this.didMount = function() {
    this._init();
  };

  this.willReceiveProps = function() {
    console.log('willreceive props');
    this.dispose();
    // TODO: This is a bit bad taste. but we need to reset to initial state if we are looking at a different
    // document
    this.state = this.getInitialState();
    this._init();
  };

  this._init = function() {
    this._loadDocument();
  };

  this.dispose = function() {
    if (this.state.session) {
      this.state.session.dispose();
    }
  };

  // Life cycle
  // ------------------------------------

  this.render = function() {
    if(this.state.error) {
      this.setStatus({
        type: 'error',
        message: this.state.error.message
      });
    }

    var status = this.state.status;
    console.log('EditNote.render', this.state);
    var authenticationClient = this.context.authenticationClient;

    var el = $$('div').addClass('sc-notepad-wrapper');

    if (this.state.session) {
      var header = $$('div').addClass('se-header');
      header.append(
        $$('div').addClass('se-actions').append(
          $$('button').addClass('se-action').append('Dashboard').on('click', this.send.bind(this, 'openDashboard')),
          $$('button').addClass('se-action').append('New Note').on('click', this.send.bind(this, 'newNote'))
        ),
        $$(LoginStatus, {
          user: authenticationClient.getUser()
        })
      );
      if(status) {
        header.append(
          $$(StatusBar, {
            status: status
          })
        );
      } else {
        header.append(
          $$(Collaborators, {
            session: this.state.session
          })
        );
      }

      el.append(
        header,
        $$(NoteWriter, {
          documentSession: this.state.session,
          // onUploadFile: hubClient.uploadFile
        }).ref('notepad')
      );
    } else {
      el.append('Loading document...');
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
  this.setStatus = function(status) {
    var self = this;
    this.extendState({
      status: status
    });
    if(status.dismiss > 0) {
      setTimeout(function(){
        self.dismissStatus();
      }, 1000*status.dismiss);
    }
  };

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
          error: new Err('EditNote.LoadingError', {
            message: 'Document could not be loaded.',
            cause: err
          })
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

      this.extendState({
        session: session
      });
    }.bind(this));
  };

};

Component.extend(EditNote);

module.exports = EditNote;