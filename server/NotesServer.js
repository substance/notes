'use strict';

var oo = require('substance/util/oo');

/*
  DocumentServer module. Can be bound to an express instance
*/
function NotesServer(config) {
  this.engine = config.notesEngine;
  this.path = config.path;
}

NotesServer.Prototype = function() {

  /*
    Attach this server to an express instance
  */
  this.bind = function(app) {
    app.get(this.path + '/dashboard/user/:id', this._getUserDashboard.bind(this));
  };

  /*
    Get a dashboard documents
  */
  this._getUserDashboard = function(req, res, next) {
    var userId = req.params.id;
    this.engine.getUserDashboard(userId, function(err, docs) {
      if (err) return next(err);
      res.json(docs);
    });
  };
};

oo.initClass(NotesServer);
module.exports = NotesServer;