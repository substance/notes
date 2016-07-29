'use strict';

var Comment = require('./Comment');
var CommentTool = require('./CommentTool');
var CommentCommand = require('./CommentCommand');
var CommentComponent = require('./CommentComponent');

module.exports = {
  name: 'comment',
  configure: function(config) {
    config.addNode(Comment);
    config.addTool(CommentTool);
    config.addCommand(CommentCommand);
    config.addComponent(Comment.static.name, CommentComponent);
  }
};