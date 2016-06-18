'use strict';

var AnnotationCommand = require('substance/ui/AnnotationCommand');

function MarkCommand() {
  MarkCommand.super.apply(this, arguments);
}

AnnotationCommand.extend(MarkCommand);

MarkCommand.static.name = 'mark';

module.exports = MarkCommand;