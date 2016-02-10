"use strict";

var EventEmitter = require('./EventEmitter');

/*
  Implements Substance Store API. This is just a stub and is used for
  testing.
*/
function ChangesStore() {
  ChangesStore.super.apply(this);
}

ChangesStore.Prototype = function() {
  /*
    Gets changes from the DB.
    
    @param {String} id changeset id
    @param {String} sinceVersion changes since version (0 = all changes, 1 all except first change)
  */
  this.getChanges = function(id, sinceVersion, cb) {
    // cb(null, changes, headVersion);
  };

  /*
    Add a change to a changeset. Implicitly creates a new changeset
    when the first change is added to 
  
    @param {String} id changeset id
    @param {String} change serialized change
  */
  this.addChange = function(id, change, cb) {
    // cb(null, change, headVersion)
  };

  /*
    Gets the version number for a document
  */
  this.getVersion = function(id, cb) {
    // HINT: version = count of changes
    // 0 changes: version = 0
    // 1 change:  version = 1

    // cb(null, headversion);
  };

  /*
    Removes a changeset from the db
    
    @param {String} id changeset id
  */
  this.deleteChangeset = function(id) {

  };

};

EventEmitter.extend(ChangesStore);
module.exports = ChangesStore;
