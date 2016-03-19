var DocumentServer = require('substance/collab/DocumentServer');

/*
  DocumentServer module. Can be bound to an express instance
*/
function NotesDocumentServer() {
  NotesDocumentServer.super.apply(this, arguments);
}

NotesDocumentServer.Prototype = function() {

  this.bind = function(app) {
    var route = this.path + '/:id';
    var userRoute = this.path + '/user/:id';
    app.get(userRoute, this._listUserDocuments.bind(this));
    app.get(route, this._getDocument.bind(this));
  };

  this._listUserDocuments = function(req, res, next) {
    var userId = req.params.id;
    this.engine.getUserDocuments(userId, function(err, result) {
      if (err) return next(err);
      res.json(result);
    });
  };
};

DocumentServer.extend(NotesDocumentServer);

module.exports = NotesDocumentServer;