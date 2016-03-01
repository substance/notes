var multer = require('multer');
var uuid = require('substance/util/uuid');
var LocalFiles = {};

LocalFiles.storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
  	var extension = file.originalname.split('.').pop();
    cb(null, uuid() + '.' + extension);
  }
});

LocalFiles.uploader = multer({
	storage: LocalFiles.storage
});

module.exports = LocalFiles;