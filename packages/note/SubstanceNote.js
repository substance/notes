'use strict';

var Document = require('substance/model/Document');

/**
  Note article class
*/
var Note = function(schema) {
  Document.call(this, schema);
  this._initialize();
};

Note.Prototype = function() {
  
  this._initialize = function() {
    this.create({
      type: 'container',
      id: 'body',
      nodes: []
    });
  };

  this.getDocumentMeta = function() {
    return this.get('meta');
  };
  
};

Document.extend(Note);

module.exports = Note;