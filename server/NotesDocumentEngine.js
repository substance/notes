var DocumentEngine = require('substance/collab/DocumentEngine');
var Err = require('substance/util/Error');

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
        return cb(new Err('DocumentEngine.ListDocumentsError', {
          cause: err
        }));
      }
      cb(null, docs);
    });
  };

  this.getCollaboratedDocuments = function(userId, cb) {
    var self = this;
    
    this.changeStore.getCollaboratedDocuments(userId, function(err, docs) {
      if (err) {
        return cb(new Err('DocumentEngine.ListCollaboratedDocumentsError', {
          cause: err
        }));
      }
      self.documentStore.getDocuments(docs, function(err, sharedDocs) {
        if (err) {
          return cb(new Err('DocumentEngine.ListCollaboratedDocumentsError', {
            cause: err
          }));
        }
        cb(null, sharedDocs);
      });
    });
  };
  
};

DocumentEngine.extend(NotesDocumentEngine);

module.exports = NotesDocumentEngine;