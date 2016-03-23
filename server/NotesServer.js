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
    app.get(this.path + '/dashboard/user/:id', this._getDasboardData.bind(this));
  };

  /*
    Generate new loginKey for user and send email with a link
  */
  this._getDasboardData = function(req, res, next) {
    var userId = req.params.id;
    this.engine.getDashboardDocs(userId, function(err, result) {
      if (err) return next(err);
      res.json(result);
    });
  };
};

oo.initClass(NotesServer);
module.exports = NotesServer;