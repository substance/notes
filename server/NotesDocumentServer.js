'use strict';

var DocumentServer = require('substance/collab/DocumentServer');

/*
  DocumentServer module. Can be bound to an express instance
*/
function NotesDocumentServer() {
  NotesDocumentServer.super.apply(this, arguments);
}

NotesDocumentServer.Prototype = function() {
  // var _super = NotesDocumentServer.super.prototype;

  // this.bind = function(app) {
  //   _super.bind.apply(this, arguments);

  //   // Add notes specific routes
  // };

};

DocumentServer.extend(NotesDocumentServer);

module.exports = NotesDocumentServer;