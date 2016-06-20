'use strict';

var AnnotationTool = require('substance/ui/AnnotationTool');

function TodoTool() {
  TodoTool.super.apply(this, arguments);
}

AnnotationTool.extend(TodoTool);

TodoTool.static.name = 'todo';

module.exports = TodoTool;
