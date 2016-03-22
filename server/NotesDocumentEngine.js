var DocumentEngine = require('substance/collab/DocumentEngine');
var Err = require('substance/util/Error');
var _ = require('substance/util/helpers');
var async = require('async');

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

	this.getUserDocuments = function(userId, cb) {
    var self = this;

    this.documentStore.listDocuments({userId: userId}, function(err, docs) {
      if (err) {
        return cb(new Err('DocumentEngine.ListDocumentsError', {
          cause: err
        }));
      }
      self.getCollaborators(docs, function(err){
        if(err) {
          return cb(new Err('DocumentEngine.GetCollaboratorsError', {
            cause: err
          }));
        }
        cb(null, docs);
      });
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
        self.getCollaborators(sharedDocs, function(err){
          if(err) {
            return cb(new Err('DocumentEngine.GetCollaboratorsError', {
              cause: err
            }));
          }
          cb(null, sharedDocs);
        });
      });
    });
  };

  this.getCollaborators = function(docs, cb) {
    var self = this;
    async.eachSeries(docs, function(doc, callback){
      self.changeStore.getCollaborators(doc.documentId, function(err, result) {
        if(err) {
          return cb(new Err('DocumentEngine.GetCollaboratorsError', {
            cause: err
          }));
        }
        doc.collaborators = _.map(result, 'userId');
        callback();
      });
    }, cb);
  };
  
};

DocumentEngine.extend(NotesDocumentEngine);

module.exports = NotesDocumentEngine;