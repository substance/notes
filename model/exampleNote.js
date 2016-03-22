'use strict';

var createDocumentFactory = require('substance/model/createDocumentFactory');
var Note = require('./Note');

module.exports = createDocumentFactory(Note, function(tx) {
  var body = tx.get('body');

  tx.create({
    id: 'metadata',
    type: 'metadata',
    title: 'New Untitled Note'
  });

  tx.create({
    id: 'p1',
    type: 'paragraph',
    content: 'Substance is a JavaScript library for web-based content editing. Build simple text editors or full-featured publishing systems. Substance provides you building blocks for your very custom editor.'
  });
  body.show('p1');

  tx.create({
    id: 'm1',
    type: 'mark',
    path: ['p1', 'content'],
    startOffset: 0,
    endOffset: 9
  });

  tx.create({
    id: 't1',
    type: 'todo',
    done: false,
    content: 'Water the plants'
  });
  body.show('t1');

  tx.create({
    id: 't2',
    type: 'todo',
    done: true,
    content: 'Fix bug'
  });
  body.show('t2');

  tx.create({
    id: 't3',
    type: 'todo',
    done: true,
    content: 'Do taxes'
  });
  body.show('t3');
});
