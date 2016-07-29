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
      page: 'note',
      documentId: documentId
    });
  };

  this.getRoute = function() {
    var routerString = this.getRouteString();
    return Router.routeStringToObject(routerString);
  };
};

Router.extend(NotesRouter);

module.exports = NotesRouter;
