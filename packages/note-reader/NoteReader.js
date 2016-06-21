'use strict';

var ProseEditor = require('substance/packages/prose-editor/ProseEditor');
var ContainerEditor = require('substance/ui/ContainerEditor');
var SplitPane = require('substance/ui/SplitPane');
var ScrollPane = require('substance/ui/ScrollPane');
var NoteCover = require('../note-cover/NoteCover');

function NoteReader() {
  NoteReader.super.apply(this, arguments);
}

NoteReader.Prototype = function() {

  this.render = function($$) {
    var configurator = this.props.configurator;
    var commandStates = this.commandManager.getCommandStates();

    return $$('div').addClass('sc-notepad').append(
      $$('div').addClass('se-note-content').append(
        $$(NoteCover, {
          configurator: configurator,
          doc: this.doc,
          mobile: this.props.mobile,
          editing: 'readonly',
          noteInfo: this.props.noteInfo
        }).ref('cover'),
        $$(ContainerEditor, {
          disabled: this.props.disabled,
          documentSession: this.documentSession,
          node: this.doc.get('body'),
          editing: 'readonly',
          commands: configurator.getSurfaceCommandNames(),
          textTypes: configurator.getTextTypes()
        }).ref('body')
      ).ref('contentPanel')
    );
  };

};

ProseEditor.extend(NoteReader);

module.exports = NoteReader;