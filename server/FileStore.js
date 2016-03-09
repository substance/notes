'use strict';

var oo = require('substance/util/oo');

// Please integrate here directly
// ------------------

// var multer = require('multer');
// var uuid = require('substance/util/uuid');
// var LocalFiles = {};

// LocalFiles.storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads');
//   },
//   filename: function (req, file, cb) {
//     var extension = file.originalname.split('.').pop();
//     cb(null, uuid() + '.' + extension);
//   }
// });
// LocalFiles.uploader = multer({
//   storage: LocalFiles.storage
// });
// module.exports = LocalFiles;

/*
  Implements Substance Store API. This is just a stub and is used for
  testing.
*/
function FileStore(config) {
  FileStore.super.apply(this, arguments);
  this.config = config;
  // this.storage = localFiles;
}

FileStore.Prototype = function() {

  /*
    Returns middleware for file uploading
  */
  this.getFileUploader = function(fieldname) {
    return this.storage.uploader.single(fieldname);
  };

  /*
    Get name of stored file
  */
  this.getFileName = function(req) {
    return req.file.filename;
  };
};

oo.initClass(FileStore);

module.exports = FileStore;
