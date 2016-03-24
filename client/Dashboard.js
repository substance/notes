var DocumentClient = require('./NotesDocumentClient');
var LoginStatus = require('./LoginStatus');
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
  	var authenticationClient = this.context.authenticationClient;
    var user = authenticationClient.getUser();
    var notes = this.state.notes;
    var myNotes = notes ? notes.myDocs : [];
    var sharedNotes = notes ? notes.collaboratedDocs : [];

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
    var userId = this._getUserId();
    var userName = this._getUserName();
    _.each(notes, function(note, i) {
      var noteItem = $$('div').addClass('se-note').append(
        $$('div').addClass('se-title').append(note.title)
      ).on('click', self.send.bind(self, 'openNote', note.documentId));
      
      // Add author inline with title for shared notes
      if (shared) {
        var created = "by " + note.creator;
        noteItem.append($$('div').addClass('se-created').append(created));
      }
      // Turn collaborators to array
      note.collaborators = note.collaborators ? note.collaborators.split(",") : [];
      // replace current user name with me
      if(!note.updatedBy || note.updatedBy === userId) {
        note.updatedBy = 'me';
      }
      var updated = "updated " + self.timeAgo(note.updatedAt) + " by " + note.updatedBy;
      noteItem.append($$('div').addClass('se-updated').append(updated));

      var editorsNumber = note.collaborators.length;
      // Remove user from collaborators as in context of dashboard 
      // you already see only docs edited by user
      var index = note.collaborators.indexOf(userName);
      if (index > -1) {
        note.collaborators.splice(index, 1);
      }
      if(note.updatedBy !== "me") {
        index = note.collaborators.indexOf(note.updatedBy);
        if (index > -1) {
          note.collaborators.splice(index, 1);
        }
      }
      var edited;
      if(note.collaborators.length > 0 && note.collaborators.length < 3) {
        edited = "edited by " + note.collaborators.join(", ");
      } else if (editorsNumber > 2) {
        edited = "edited by " + note.collaborators.join(", ") + " and " + (editorsNumber.length - 2) + " other collaborators"; 
      }
      if(note.collaborators.length > 0) {
        noteItem.append($$('div').addClass('se-edited').append(edited));
      }
      // Add featured class for both lists first items
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
        notes: notes
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