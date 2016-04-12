'use strict';

var Router = require('substance/ui/Router');

function NotesRouter(app) {
  Router.call(this);
  this.app = app;
}

NotesRouter.Prototype = function() {

  this.stateFromRoute = function(route) {
    console.log('NotesRouter.stateFromRoute');
    if (!route) {
      this.app.updateState(this.app.getInitialState(), 'silent');
    } else {
      var state = Router.routeStringToObject(route);
      this.app.updateState(state, 'silent');
    }
  };

  this.routeFromState = function() {
    var state = {};
    var appState = this.app.state;
    ["mode", "docId"].forEach(function(key) {
      if (appState.hasOwnProperty(key)) {
        state[key] = appState[key];
      }
    });
    return Router.objectToRouteString(state);
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
