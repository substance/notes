'use strict';

var AnnotationTool = require('substance/ui/AnnotationTool');

function CommentTool() {
  CommentTool.super.apply(this, arguments);
}

AnnotationTool.extend(CommentTool);

CommentTool.static.name = 'comment';

module.exports = CommentTool;
