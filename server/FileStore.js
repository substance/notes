'use strict';

var oo = require('substance/util/oo');
var uuid = require('substance/util/uuid');
var multer = require('multer');

/*
  Implements Substance Store API.
*/
function FileStore(config) {
  this.storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.destination);
    },
    filename: function (req, file, cb) {
      var extension = file.originalname.split('.').pop();
      cb(null, uuid() + '.' + extension);
    }
  });
  this.uploader = multer({
    storage: this.storage
  });
}

FileStore.Prototype = function() {

  /*
    Returns middleware for file uploading
  */
  this.getFileUploader = function(fieldname) {
    return this.uploader.single(fieldname);
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
