var DocumentClient = require('./NotesDocumentClient');
var LoginStatus = require('./LoginStatus');
var differenceBy = require('lodash/differenceBy');
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
    var el = $$('div').addClass('sc-dashboard');

    var topbar = $$('div').addClass('se-header').append(
    	$$('div').addClass('se-actions').append(
	      $$('button').addClass('se-action se-new-note').on('click', this.send.bind(this, 'newNote')).append('New Note')
	    ),
	    $$(LoginStatus, {
        user: authenticationClient.getUser()
      })
    );
    el.append(topbar);
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

};

Component.extend(Dashboard);

module.exports = Dashboard;