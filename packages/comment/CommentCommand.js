'use strict';

var AnnotationCommand = require('substance/ui/AnnotationCommand');

var CommentCommand = AnnotationCommand.extend();

CommentCommand.static.name = 'comment';

module.exports = CommentCommand;
