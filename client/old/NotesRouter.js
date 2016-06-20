'use strict';

var Router = require('substance/ui/Router');

function NotesRouter(app) {
  Router.call(this);
  this.app = app;
}

NotesRouter.Prototype = function() {

  // URL helpers
  this.openNote = function(documentId) {
    return '#' + Router.objectToRouteString({
      section: 'note',
      documentId: documentId
    });
  };
};

Router.extend(NotesRouter);

module.exports = NotesRouter;
