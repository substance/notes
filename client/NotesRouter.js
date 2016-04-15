'use strict';

var Router = require('substance/ui/Router');

function NotesRouter(app) {
  Router.call(this);
  this.app = app;
}

NotesRouter.Prototype = function() {

  this.deserializeRoute = function(routeString) {
    console.log('NotesRouter.stateFromRoute');
    var route;
    if (!routeString) {
      route = this.app.getInitialState();
    } else {
      route = Router.routeStringToObject(route);
    }
    return route;
  };

  this.serializeRoute = function(routeString) {
    return Router.objectToRouteString();
  };

  // URL helpers
  this.openNote = function(docId) {
    return '#' + Router.objectToRouteString({
      mode: 'edit',
      docId: docId
    });
  };

};

Router.extend(NotesRouter);

module.exports = NotesRouter;
