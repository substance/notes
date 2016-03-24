var Note = require('./Note');
var DocumentSession = require('substance/model/DocumentSession');

/*
  Returns an example changeset describing the contents of the document
*/
function exampleNoteChangeset() {

  var doc = new Note();
  var session = new DocumentSession(doc);

  var change = session.transaction(function(tx) {
    var body = tx.get('body');

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

  return [change.toJSON()];
}

module.exports = exampleNoteChangeset;
