var DocumentClient = require('./NotesDocumentClient');
var Err = require('substance/util/Error');
var Header = require('./Header');
var Button = require('substance/ui/Button');
var Grid = require('substance/ui/Grid');
var Component = require('substance/ui/Component');
var NoteItem = require('./NoteItem');

var $$ = Component.$$;

function Dashboard() {
  Component.apply(this, arguments);
  var config = this.context.config;
  
  this.documentClient = new DocumentClient({
    httpUrl: config.documentServerUrl || 'http://'+config.host+':'+config.port+'/api/documents/'
  });
}

Dashboard.Prototype = function() {

  // Life cycle
  // ------------------------------------

  this.didMount = function() {
    this._init();
  };

  this._init = function() {
    this._loadDocuments();
  };

  this.render = function() {
    var noteItems = this.state.noteItems;

    var el = $$('div').addClass('sc-dashboard');

    if (!noteItems) {
      return el;
    }

    var header = $$(Header, {
      actions: {
        'newNote': 'New Note'
      }
    });

    var grid = $$(Grid).addClass('sh-limiter se-dashboard-grid');

    // Summary + new note button
    grid.append(
      $$(Grid.Row).addClass('se-intro').append(
        $$(Grid.Cell, {columns: 8}).addClass('sh-quiet').append(
          'Showing ',
          noteItems.length.toString(),
          ' notes'
        ),
        $$(Grid.Cell, {columns: 4}).addClass('sh-right-align').append(
          $$(Button).append('New Note')
            .on('click', this.send.bind(this, 'newNote'))
        )
      )
    );

    if (noteItems) {
      noteItems.forEach(function(noteItem) {
        // HACK: server should serve collaborators as an array
        // noteItem.collaborators =  noteItem.collaborators ? noteItem.collaborators.split(',') : [];
        grid.append(
          $$(Grid.Row).append(
            $$(Grid.Cell, {columns: 12}).append(
              $$(NoteItem, noteItem)
            )
          )
        );
      });
    }

    el.append(
      header,
      grid
    );
    return el;
  };

  this._getUserId = function() {
    var authenticationClient = this.context.authenticationClient;
    var user = authenticationClient.getUser();
    return user.userId;
  };

  this._getUserName = function() {
    var authenticationClient = this.context.authenticationClient;
    var user = authenticationClient.getUser();
    return user.name;
  };

  /*
    Loads documents
  */
  this._loadDocuments = function() {
    var self = this;
    var documentClient = this.documentClient;
    var userId = this._getUserId();

    documentClient.listUserDashboard(userId, function(err, notes) {
      if (err) {
        this.setState({
          error: new Err('Dashboard.LoadingError', {
            message: 'Documents could not be loaded.',
            cause: err
          })
        });
        console.error('ERROR', err);
        return;
      }
      // HACK: For debugging purposes
      window.notes = notes;

      self.extendState({
        noteItems: notes
      });
    }.bind(this));
  };

};

Component.extend(Dashboard);

module.exports = Dashboard;