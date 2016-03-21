var DocumentServer = require('substance/collab/DocumentServer');

/*
  DocumentServer module. Can be bound to an express instance
*/
function NotesDocumentServer() {
  NotesDocumentServer.super.apply(this, arguments);
}

NotesDocumentServer.Prototype = function() {
  var _super = NotesDocumentServer.super.prototype;

  this.bind = function(app) {
    _super.bind.apply(this, arguments);

    // Add notes specific routes
    app.get(this.path + '/user/collaborated/:id', this._listCollaboratedDocuments.bind(this));
    app.get(this.path + '/user/:id', this._listUserDocuments.bind(this));
  };

  this._listUserDocuments = function(req, res, next) {
    var userId = req.params.id;
    this.engine.getUserDocuments(userId, function(err, result) {
      if (err) return next(err);
      res.json(result);
    });
  };

  this._listCollaboratedDocuments = function(req, res, next) {
    var userId = req.params.id;
    this.engine.getCollaboratedDocuments(userId, function(err, result) {
      if (err) return next(err);
      res.json(result);
    });
  };

};

DocumentServer.extend(NotesDocumentServer);

module.exports = NotesDocumentServer;