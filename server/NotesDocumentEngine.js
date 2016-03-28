var DocumentEngine = require('substance/collab/DocumentEngine');
var _ = require('substance/util/helpers');
var Err = require('substance/util/Error');

/*
  DocumentEngine
*/
function NotesDocumentEngine(config) {
  NotesDocumentEngine.super.apply(this, arguments);
  this.db = config.db.connection;
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
    args.info.title = doc.get(['meta', 'title']);
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
    var query = "SELECT d.documentId, d.updatedAt, d.version, d.schemaName, d.schemaVersion, (SELECT createdAt FROM changes c WHERE c.documentId=d.documentId ORDER BY createdAt ASC LIMIT 1) AS createdAt, u.name AS author, f.name AS updatedBy FROM documents d JOIN users u ON(u.userId=d.userId) JOIN users f ON(f.userId=d.updatedBy) WHERE d.documentId = ?";
    
    this.db.raw(query, [documentId]).asCallback(function(err, doc) {
      if (err) {
        return cb(new Err('NotesDocumentEngine.ReadDocumentMetaDataError', {
          cause: err
        }));
      }
      doc = doc[0];
      if (!doc) {
        return cb(new Err('NotesDocumentEngine.ReadDocumentMetaDataError', {
          message: 'No document found for documentId ' + documentId,
        }));
      }
      self.getDocumentCollaborators(doc.documentId, doc.userId, function(err, collaborators) {
        if (err) {
          return cb(new Err('NotesDocumentEngine.ReadDocumentCollaboratorsError', {
            cause: err
          }));
        }
        doc.collaborators = collaborators;
        cb(null, doc);
      });
    });
  };


  /*
    Get collaborators for a document (author not a collaborator)
  */
  this.getDocumentCollaborators = function(id, author, cb) {
    var query = "SELECT distinct u.name FROM changes c INNER JOIN users u ON(u.userId=c.userId) WHERE c.documentId = ? AND c.userId != ?";

    this.db.raw(query, [id, author]).asCallback(function(err, result) {
      if (err) {
        return cb(new Err('ChangeStore.ReadCollaboratorsError', {
          cause: err
        }));
      }
      var collaborators = _.map(result, function(col) {return col.name; });
      cb(null, collaborators);
    });
  };

};

DocumentEngine.extend(NotesDocumentEngine);

module.exports = NotesDocumentEngine;