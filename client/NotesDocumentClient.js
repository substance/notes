var DocumentClient = require('substance/collab/DocumentClient');

/*
  HTTP client for talking with DocumentServer
*/

function NotesDocumentClient() {
  NotesDocumentClient.super.apply(this, arguments);
}

NotesDocumentClient.Prototype = function() {

  this.listUserDocuments = function(userId, cb) {
    this._request('GET', this.config.httpUrl+'user/'+userId, null, cb);
  };

};

DocumentClient.extend(NotesDocumentClient);

module.exports = NotesDocumentClient;
