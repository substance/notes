'use strict';

var AnnotationTool = require('substance/ui/AnnotationTool');

function TodoTool() {
  TodoTool.super.apply(this, arguments);
}

AnnotationTool.extend(TodoTool);

module.exports = TodoTool;
