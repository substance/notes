"use strict";

var EventEmitter = require('substance/util/EventEmitter');
var _ = require('substance/util/helpers');

/*
  Implements Snapshot API.
*/
function Snapshot(store, model) {
  this.store = store;
  this.model = model;
  Snapshot.super.apply(this);
}

Snapshot.Prototype = function() {

  this.get = function(id, cb) {
    var self = this;
    this.store.getChanges(id, 0, function(err, version, changes) {
      if(err) return cb(err);
      var doc = new self.model();
      _.each(changes, function(change) {
        _.each(change.ops, function(op){
          doc.data.apply(op);
        });
      });
      cb(null, doc.toJSON(), version);
    });
  };

};

EventEmitter.extend(Snapshot);

module.exports = Snapshot;