'use strict';

var Command = require('substance/ui/Command');

function TodoCommand() {
  TodoCommand.super.apply(this, arguments);
}

TodoCommand.Prototype = function() {

  this.getCommandState = function(props, context) {
    var surface = props.surface;
    var sel = props.selection;
    var disabled = !surface || sel.isNull() || !sel.isPropertySelection();
    var targetType = this.getTargetType(props, context);

    return {
      targetType: targetType,
      active: targetType !== 'todo',
      disabled: disabled
    };
  };

  this.execute = function(props, context) {
    var sel = props.selection;
    if (!sel.isPropertySelection()) return;
    var surface = props.surface;
    var targetType = this.getTargetType(props, context);

    if (targetType) {
      // A Surface transaction performs a sequence of document operations
      // and also considers the active selection.
      surface.transaction(function(tx, args) {
        args.data = {
          type: targetType
        };
        return surface.switchType(tx, args);
      });
      return {status: 'ok'};
    }
  };

  this.getTargetType = function(props, context) {
    var sel = props.selection;
    if (sel.isNull() || !sel.isPropertySelection()) return null;
    var doc = context.doc;
    var path = sel.getPath();
    var node = doc.get(path[0]);
    // HACK: We should make sure the getCommandState is not called for
    // an invalid selection.
    if (!node) return 'paragraph';
    var nodeType = node.type;

    if (nodeType === 'todo') {
      return 'paragraph';
    } else {
      return 'todo';
    }
  };
};

Command.extend(TodoCommand);

module.exports = TodoCommand;