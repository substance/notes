'use strict';

var AnnotationCommand = require('substance/ui/AnnotationCommand');

var TodoCommand = AnnotationCommand.extend();

TodoCommand.static.name = 'todo';

module.exports = TodoCommand;