var CollabSession = require('substance/collab/CollabSession');
var JSONConverter = require('substance/model/JSONConverter');
var Note = require('../note/Note');
var Collaborators = require('./Collaborators');
var LoginStatus = require('./LoginStatus');
var converter = new JSONConverter();
var NoteWriter = require('./NoteWriter');
var Component = require('substance/ui/Component');
var $$ = Component.$$;

function Notepad() {
  Component.apply(this, arguments);
}

Notepad.Prototype = function() {

  this.getInitialState = function() {
    return {
      session: null, // CollabSession will be stored here, if null indicates we are in loading state
      error: null // used to display error messages e.g. loading of document failed
    };
  };

  // Life cycle
  // ------------------------------------

  this.didMount = function() {
    console.log('did mount');
    this._init();
  };

  this.willReceiveProps = function() {
    console.log('willreceive props');
    this.dispose();
    // TODO: In React it's possible
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
    console.log('Notepad.render', this._state);
    var hubClient = this.context.hubClient;

    var el = $$('div').addClass('sc-notepad-wrapper');

    if (this.state.error) {
      // TODO: render this in a pop in addition to the regular content
      el.append('div').addClass('se-error').append(this.state.error.message);
    } else if (this.state.session) {
      el.append(
        $$('div').addClass('se-header').append(
          $$('div').addClass('se-actions').append(
            $$('button').addClass('se-action').append('New Note') // .on('click', this.send.bind(this, 'newNote'))
          ),
          $$(LoginStatus, {
            user: hubClient.getUser()
          }),
          $$(Collaborators, {
            session: this.state.session
          })
        ),
        $$(NoteWriter, {
          documentSession: this.state.session,
          onUploadFile: hubClient.uploadFile
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
    Loads a document and initializes a CollabSession
  */
  this._loadDocument = function() {
    var hubClient = this.context.hubClient;

    // TODO: API could be improved. Maybe better call it jsonDoc and 
    // provide version just via property
    hubClient.getDocument(this.props.docId, function(err, rawDoc) {
      if (err) {
        this.setState({
          error: new Error('Document could not be loaded')
        });
        console.log('ERROR', err);
        return;
      }
      
      var doc = new Note();
      doc = converter.importDocument(doc, rawDoc.document);
      var session = new CollabSession(doc, {
        docId: this.props.docId,
        docVersion: rawDoc.version,
        hubClient: hubClient
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

Component.extend(Notepad);

module.exports = Notepad;