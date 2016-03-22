var DocumentClient = require('./NotesDocumentClient');
var LoginStatus = require('./LoginStatus');
var differenceBy = require('lodash/differenceBy');
var orderBy = require('lodash/orderBy');
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
    var user = authenticationClient.getUser();
    var myNotes = this.state.myNotes;
    var sharedNotes = this.state.sharedNotes;
    var el = $$('div').addClass('sc-dashboard');

    var topbar = $$('div').addClass('se-header').append(
    	$$('div').addClass('se-actions').append(
	      $$('button').addClass('se-action se-new-note').on('click', this.send.bind(this, 'newNote')).append('New Note')
	    ),
	    $$(LoginStatus, {
        user: user
      })
    );

    var myNotesList = $$('div').addClass('se-my-notes se-notes-list');
    myNotesList.append($$('div').addClass('se-section-title').append('My notes'));
    myNotesList.append(this._renderNotesList(myNotes));

    var sharedNotesList = $$('div').addClass('se-shared-notes se-notes-list');
    sharedNotesList.append($$('div').addClass('se-section-title').append('Collaborated notes'));
    sharedNotesList.append(this._renderNotesList(sharedNotes, true));

    
    el.append(topbar);
    el.append(myNotesList);
    el.append(sharedNotesList);
    
    return el;
  };

  // Helpers
  // ------------------------------------

  this._renderNotesList = function(notes, shared) {
    var self = this;
    var list = [];
    var authenticationClient = this.context.authenticationClient;
    var user = authenticationClient.getUser();
    _.each(notes, function(note, i) {
      if(!note.updatedBy || note.updatedBy === user) {
        note.updatedBy = 'me';
      }
      var updated = "updated " + self.timeAgo(note.updatedAt);
      var created = "by " + note.userId;
      if(user !== note.updatedBy) updated += " by " + note.updatedBy;
      var latestCollaborators = note.collaborators.slice(0, 2);
      var restCollaborators = note.collaborators.slice(2, note.collaborators.length);
      var edited = "edited by " + latestCollaborators.join(", "); 
      if (restCollaborators.length == 1) edited += " and 1 other collaborator";
      if (restCollaborators.length > 1) edited += " and " + restCollaborators.length + " other collaborators"; 
      var noteItem = $$('div').addClass('se-note').append(
        $$('div').addClass('se-title').append(note.title)
      );
      if(shared) noteItem.append($$('div').addClass('se-created').append(created));
      noteItem.append(
        $$('div').addClass('se-updated').append(updated),
        $$('div').addClass('se-edited').append(edited)
      );
      if(i === 0) noteItem.addClass('featured');
      list.push(noteItem);
    });

    return list;
  };

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

    documentClient.listUserDocuments(userId, function(err, myNotes) {
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


      documentClient.listCollaboratedDocuments(userId, function(err, sharedNotes) {
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
        sharedNotes = differenceBy(sharedNotes, myNotes, 'documentId');
        sharedNotes = orderBy(sharedNotes, ['updatedAt'], ['desc']);
        myNotes = orderBy(myNotes, ['updatedAt'], ['desc']);
        // HACK: For debugging purposes
        window.myNotes = myNotes;
        window.sharedNotes = sharedNotes;

        self.extendState({
          myNotes: myNotes,
          sharedNotes: sharedNotes
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