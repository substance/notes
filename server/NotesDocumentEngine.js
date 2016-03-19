var DocumentEngine = require('substance/collab/DocumentEngine');

/*
  DocumentEngine
*/
function NotesDocumentEngine() {
  NotesDocumentEngine.super.apply(this, arguments);
}

NotesDocumentEngine.Prototype = function() {

	this.getUserDocuments = function(userId, cb) {
    this.documentStore.listDocuments({userId: userId}, function(err, docs) {
      if (err) {
        return cb(new Err('DocumentEngine.ListDocumentError', {
          cause: err
        }));
      }
      cb(null, docs);
    });
  };
  
};

DocumentEngine.extend(NotesDocumentEngine);

module.exports = NotesDocumentEngine;