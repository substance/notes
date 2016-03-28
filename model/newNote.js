'use strict';

var createDocumentFactory = require('substance/model/createDocumentFactory');
var Note = require('./Note');

module.exports = createDocumentFactory(Note, function(tx) {
  var body = tx.get('body');

  tx.create({
    id: 'meta',
    type: 'meta',
    title: 'Untitled Note'
  });

  tx.create({
    id: 'p1',
    type: 'paragraph',
    content: 'Write your note here.'
  });
  body.show('p1');
});
