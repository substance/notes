var multer = require('multer');
var uuid = require('substance/util/uuid');
var LocalFiles = {};

LocalFiles.storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
  	var extension = file.originalname.split('.').pop();
    cb(null, uuid() + '.' + extension)
  }
});

LocalFiles.uploader = multer({
	storage: LocalFiles.storage
});

// var handleUpload = function(req, res, next) {
// 	res.json({name: req.file.filename});
// };

// Figures.addRoutes = function(app) {
//   app.post('/hub/api/upload', figureUploader.single('figure'), handleUpload);
// };

module.exports = LocalFiles;