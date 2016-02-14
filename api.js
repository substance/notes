var express = require('express');
var api = express.Router();
var Note = require('./note/Note');
var Snapshot = require('./hub/Snapshot')
var snapshot;

var getSnapshot = function(req, res, next) {
	snapshot.get(req.params.id, function(err, doc, version) {
		if(err) return next(err);
		res.json([doc, version]);
	});
};

api.route('/snapshot/:id')
		.get(getSnapshot);

api.register = function(store) {
	snapshot = new Snapshot(store, Note);
	return api;
}

module.exports = api.register;

// //snapshot.get('note-1');

// function Api(app, store) {
// 	this.app = app;
// 	this.store = store;
// 	this.snapshot = new Snapshot(store, Note);
//   Api.super.apply(this);
// };

// Api.Prototype = function() {
	
// 	this.getSnapshot = function(req, res, next) {
// 		var self = this;

// 		console.log(self)
// 		self.snapshot.get(req.params.id, function(err, doc, version) {
// 			if(err) return next(err);
// 			res.json([doc, version]);
// 		});
// 	};


// 	this.register = function() {
// 		this.app.route('/snapshot/:id')
// 			.get(this.getSnapshot);
// 	};
// 	// var

// 	// app.route('/snapshot')
// 	// 	.get(getSnapshot)
// };

// EventEmitter.extend(Api);

// module.exports = Api;