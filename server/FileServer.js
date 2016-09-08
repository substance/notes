'use strict';

var oo = require('substance/util/oo');
var Err = require('substance/util/SubstanceError');

/*
  FileServer module. Can be bound to an express instance
*/
function FileServer(config) {
  this.path = config.path;
  this.store = config.store;
}

FileServer.Prototype = function() {

  /*
    Attach this server to an express instance
  */
  this.bind = function(app) {
    app.post(this.path, this._uploadFile.bind(this));
  };

  /*
    Upload a file
  */
  this._uploadFile = function(req, res, next) {
    var self = this;
    var uploader = this.store.getFileUploader('files');
    uploader(req, res, function (err) {
      if (err) {
        return next(new Err('FileStore.UploadError', {
          cause: err
        }));
      }
      res.json({name: self.store.getFileName(req)});
    });
  };
};

oo.initClass(FileServer);
module.exports = FileServer;