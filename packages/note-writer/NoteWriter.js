'use strict';

var ProseEditor = require('substance/packages/prose-editor/ProseEditor');
var ContainerEditor = require('substance/ui/ContainerEditor');
var SplitPane = require('substance/ui/SplitPane');
var ScrollPane = require('substance/ui/ScrollPane');

function NoteWriter() {
  NoteWriter.super.apply(this, arguments);
}

NoteWriter.Prototype = function() {

  this.render = function($$) {
    var configurator = this.props.configurator;
    var commandStates = this.commandManager.getCommandStates();
    var ToolbarClass = configurator.getToolbarClass();

    return $$('div').addClass('sc-note-writer').append(
      $$(SplitPane, {splitType: 'horizontal'}).append(
        $$(ToolbarClass, {
          commandStates: commandStates
        }).ref('toolbar'),
        $$(ScrollPane, {
          scrollbarType: 'substance',
          scrollbarPosition: 'right',
          overlay: ProseEditorOverlay,
        }).append(
          $$(ContainerEditor, {
            disabled: this.props.disabled,
            documentSession: this.documentSession,
            node: this.doc.get('body'),
            commands: configurator.getSurfaceCommandNames(),
            textTypes: configurator.getTextTypes()
          }).ref('body')
        ).ref('contentPanel')
      )
    );
  };

};

ProseEditor.extend(NoteWriter);

module.exports = NoteWriter;