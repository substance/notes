var express = require('express');
var api = express.Router();
var multer = require('multer');
var uuid = require('substance/util/uuid')
var Note = require('./note/Note');
var Snapshot = require('./hub/Snapshot')
var snapshot;

var figureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
  	var extension = file.originalname.split('.').pop();
    cb(null, uuid() + '.' + extension)
  }
})

var figureUploader = multer({
	storage: figureStorage
});

var getSnapshot = function(req, res, next) {
  snapshot.get(req.params.id, function(err, doc, version) {
    if(err) return next(err);
    res.json([doc, version]);
  });
};

var handleUpload = function(req, res, next) {
	res.send('ok');
};

api.route('/snapshot/:id')
	.get(getSnapshot);

api.route('/upload')
	.post(figureUploader.single('figure'), handleUpload);

api.register = function(store) {
  snapshot = new Snapshot(store, Note);
  return api;
}

module.exports = api.register;