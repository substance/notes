'use strict';

var DocumentSchema = require('substance/model/DocumentSchema');
var DocumentNode = require('substance/model/DocumentNode');
var TextBlock = require('substance/model/TextBlock');
var PropertyAnnotation = require('substance/model/PropertyAnnotation');

/**
  Simple mark for highlighting text in a note
*/

function Mark() {
  Mark.super.apply(this, arguments);
}
PropertyAnnotation.extend(Mark);
Mark.static.name = 'mark';

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

/**
  Comment item for inline commenting
*/

function Comment() {
  Comment.super.apply(this, arguments);
}

TextBlock.extend(Comment);
Comment.static.name = 'comment';

Comment.static.defineSchema({
  content: 'text',
  author: { type: 'string', default: '' },
  createdAt: { type: 'string', default: new Date().toISOString() }
});

/**
  Meta
*/

function Meta() {
  Meta.super.apply(this, arguments);
}

DocumentNode.extend(Meta);

Meta.static.name = 'meta';

Meta.static.defineSchema({
  title: { type: 'string', default: 'Untitled'}
});

/**
  Schema instance
*/
var schema = new DocumentSchema('substance-note', '1.0.0');
schema.getDefaultTextType = function() {
  return 'paragraph';
};

schema.addNodes([
  require('substance/packages/paragraph/Paragraph'),
  require('substance/packages/heading/Heading'),
  require('substance/packages/codeblock/Codeblock'),
  require('substance/packages/blockquote/Blockquote'),
  require('substance/packages/image/Image'),
  require('substance/packages/emphasis/Emphasis'),
  require('substance/packages/strong/Strong'),
  require('substance/packages/code/Code'),
  require('substance/packages/link/Link'),
  Comment,
  Todo,
  Mark,
  Meta
]);

module.exports = schema;
