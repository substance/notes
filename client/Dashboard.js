var DocumentClient = require('./NotesDocumentClient');
var LoginStatus = require('./LoginStatus');
var differenceBy = require('lodash/differenceBy');
var _ = require('substance/util/helpers');
var Err = require('substance/util/Error');
var Component = require('substance/ui/Component');
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
    var self = this;
  	var authenticationClient = this.context.authenticationClient;
    var myNotes = this.state.myDocs;
    var sharedNotes = this.state.sharedDocs;
    var el = $$('div').addClass('sc-dashboard');

    var topbar = $$('div').addClass('se-header').append(
    	$$('div').addClass('se-actions').append(
	      $$('button').addClass('se-action se-new-note').on('click', this.send.bind(this, 'newNote')).append('New Note')
	    ),
	    $$(LoginStatus, {
        user: authenticationClient.getUser()
      })
    );

    var myNotesList = $$('div').addClass('se-my-notes se-notes-list');
    myNotesList.append($$('div').addClass('se-section-title').append('My notes'));

    _.each(myNotes, function(note, i) {
      note.title = 'Once Upon a Long Ago';
      note.updatedAt = 1458596224265;
      note.updatedBy = 'michael';
      note.collaborators = ['daniel', 'oliver'];
      var updated = "updated " + self.timeAgo(note.updatedAt);
      if(authenticationClient.getUser() !== note.updatedBy) updated += " by " + note.updatedBy;
      var edited = "edited by " + note.collaborators.join(", ") + " and 13 other collaborators"; 
      var noteItem = $$('div').addClass('se-note').append(
        $$('div').addClass('se-title').append(note.title),
        $$('div').addClass('se-updated').append(updated),
        $$('div').addClass('se-edited').append(edited)
      );
      if(i === 0) noteItem.addClass('featured');
      myNotesList.append(noteItem);
    });

    var sharedNotesList = $$('div').addClass('se-shared-notes se-notes-list');
    sharedNotesList.append($$('div').addClass('se-section-title').append('Collaborated notes'));

    _.each(sharedNotes, function(note, i) {
      note.title = 'Blowing in the Wind';
      note.updatedAt = 1458602662041;
      note.updatedBy = 'oliver';
      note.collaborators = ['michael', 'daniel'];
      var created = "by " + note.userId;
      var updated = "updated " + self.timeAgo(note.updatedAt);
      if(authenticationClient.getUser() !== note.updatedBy) updated += " by " + note.updatedBy;
      var edited = "edited by " + note.collaborators.join(", ") + " and 13 other collaborators"; 
      var noteItem = $$('div').addClass('se-note').append(
        $$('div').addClass('se-title').append(note.title),
        $$('div').addClass('se-created').append(created),
        $$('div').addClass('se-updated').append(updated),
        $$('div').addClass('se-ed').append(edited)
      );
      if(i === 0) noteItem.addClass('featured');
      sharedNotesList.append(noteItem);
    });
    
    el.append(topbar);
    el.append(myNotesList);
    el.append(sharedNotesList);
    
    return el;
  };

  // Helpers
  // ------------------------------------

  this._getUserId = function() {
    var authenticationClient = this.context.authenticationClient;
    var user = authenticationClient.getUser();
    return user.userId;
  };

  /*
    Loads documents
  */
  this._loadDocuments = function() {
    var self = this;
    var documentClient = this.documentClient;
    var userId = this._getUserId();

    documentClient.listUserDocuments(userId, function(err, myDocs) {
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

      documentClient.listCollaboratedDocuments(userId, function(err, sharedDocs) {
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
        sharedDocs = differenceBy(sharedDocs, myDocs, 'documentId');
        // HACK: For debugging purposes
        window.myDocs = myDocs;
        window.sharedDocs = sharedDocs;

        self.extendState({
          myDocs: myDocs,
          sharedDocs: sharedDocs
        });
      });
    }.bind(this));
  };

  this.timeAgo = function(time) {
    var units = [
      { name: "second", limit: 60, in_seconds: 1 },
      { name: "minute", limit: 3600, in_seconds: 60 },
      { name: "hour", limit: 86400, in_seconds: 3600  },
      { name: "day", limit: 604800, in_seconds: 86400 },
      { name: "week", limit: 2629743, in_seconds: 604800  },
      { name: "month", limit: 31556926, in_seconds: 2629743 },
      { name: "year", limit: null, in_seconds: 31556926 }
    ];
    var diff = (new Date() - new Date(time)) / 1000;
    if (diff < 5) return "now";
    
    var i = 0, unit;
    while (i < units.length) {
      unit = units[i++];
      if (diff < unit.limit || !unit.limit){
        diff =  Math.floor(diff / unit.in_seconds);
        return diff + " " + unit.name + (diff>1 ? "s" : "") + " ago";
      }
    }
  };

};

Component.extend(Dashboard);

module.exports = Dashboard;