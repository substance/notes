'use strict';

var SurfaceTool = require('substance/ui/SurfaceTool');

function CommentTool() {
  CommentTool.super.apply(this, arguments);
}

SurfaceTool.extend(CommentTool);

CommentTool.static.name = 'comment';
CommentTool.static.command = 'comment';

module.exports = CommentTool;
