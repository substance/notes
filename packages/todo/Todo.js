'use strict';

var TextBlock = require('substance/model/TextBlock');

/**
  Todo item represented with annotated text (content) and boolean flag (done).
*/

function Todo() {
  Todo.super.apply(this, arguments);
}

TextBlock.extend(Todo);

Todo.static.name = 'todo';

Todo.static.defineSchema({
  content: 'text',
  done: { type: 'bool', default: false }
});

module.exports = Todo;