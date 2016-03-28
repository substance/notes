var DocumentEngine = require('substance/collab/DocumentEngine');
var Err = require('substance/util/Error');

/*
  DocumentEngine
*/
function NotesDocumentEngine() {
  NotesDocumentEngine.super.apply(this, arguments);
}

NotesDocumentEngine.Prototype = function() {

  var _super = NotesDocumentEngine.super.prototype;

  this.createDocument = function(args, cb) {
    var schemaConfig = this.schemas[args.schemaName];
    if (!schemaConfig) {
      return cb(new Err('SchemaNotFoundError', {
        message: 'Schema not found for ' + args.schemaName
      }));
    }
    var docFactory = schemaConfig.documentFactory;
    var doc = docFactory.createArticle();
    args.info.updatedAt = new Date();
    args.info.title = doc.get(['metadata', 'title']);
    _super.createDocument.call(this, args, cb);
  };

  this.getDocument = function(args, cb) {
    var self = this;
    // SQL query powered
    this.queryDocumentMetaData(args.documentId, function(err, docEntry) {
      if (err) {
        return cb(new Err('NotesDocumentEngine.ReadDocumentMetadataError', {
          cause: err
        }));
      }
      self.snapshotEngine.getSnapshot(args, function(err, snapshot) {
        if (err) {
          return cb(new Err('NotesDocumentEngine.ReadSnapshotError', {
            cause: err
          }));
        }
        docEntry.data = snapshot.data;
        cb(null, docEntry);
      });
    });
  };

  this.queryDocumentMetaData = function(documentId, cb) {
    var self = this;
    this.documentStore.getDocument(documentId, function(err, docEntry) {
      if (err) {
        return cb(new Err('NotesDocumentEngine.ReadDocumentError', {
          cause: err
        }));
      }
      self.changeStore.getCollaborators(docEntry.documentId, docEntry.userId, function(err, collaborators) {
        if (err) {
          return cb(new Err('NotesDocumentEngine.ReadDocumentCollaboratorsError', {
            cause: err
          }));
        }
        docEntry.collaborators = collaborators;
        cb(null, docEntry);
      });
    });
  };

};

DocumentEngine.extend(NotesDocumentEngine);

module.exports = NotesDocumentEngine;