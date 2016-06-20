'use strict';

var ProseEditor = require('substance/packages/prose-editor/ProseEditor');
var ContainerEditor = require('substance/ui/ContainerEditor');
var SplitPane = require('substance/ui/SplitPane');
var ScrollPane = require('substance/ui/ScrollPane');

function NoteReader() {
  NoteWriter.super.apply(this, arguments);
}

NoteReader.Prototype = function() {

  this.render = function($$) {
    var configurator = this.props.configurator;
    var commandStates = this.commandManager.getCommandStates();

    return $$('div').addClass('sc-note-writer').append(
      $$(SplitPane, {splitType: 'horizontal'}).append(
        $$(ScrollPane, {
          scrollbarType: 'substance',
          scrollbarPosition: 'right',
          overlay: ProseEditorOverlay,
        }).append(
          $$(ContainerEditor, {
            disabled: this.props.disabled,
            documentSession: this.documentSession,
            node: this.doc.get('body'),
            editing: 'readonly',
            commands: configurator.getSurfaceCommandNames(),
            textTypes: configurator.getTextTypes()
          }).ref('body')
        ).ref('contentPanel')
      )
    );
  };

};

ProseEditor.extend(NoteReader);

module.exports = NoteReader;