'use strict';

var each = require('lodash/each');
var Router = require('substance/ui/_Router');

function NotesRouter(app) {
  Router.call(this);

  this.app = app;
}

NotesRouter.Prototype = function() {

  this.stateFromRoute = function(route) {
    if (!route) {
      this.app.setState(this.app.getInitialState());
    } else {
      var params = route.split(',');
      var state = {};
      params.forEach(function(param) {
        var tuple = param.split('=');
        if (tuple.length !== 2) {
          throw new Error('Illegal route.');
        }
        state[tuple[0].trim()] = tuple[1].trim();
      });
      this.app.setState(state);
    }
  };

  this.routeFromState = function() {
    var state = this.app.state;
    var route = [];
    each(state, function(val, key) {
      route.push(key+'='+val);
    });
    this.setRoute(route.join(','));
  };

};

Router.extend(NotesRouter);

module.exports = NotesRouter;
