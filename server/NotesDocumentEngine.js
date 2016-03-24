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
  
};

DocumentEngine.extend(NotesDocumentEngine);

module.exports = NotesDocumentEngine;