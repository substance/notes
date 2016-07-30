'use strict';

var ProseEditor = require('substance/packages/prose-editor/ProseEditor');
var ContainerEditor = require('substance/ui/ContainerEditor');
var SplitPane = require('substance/ui/SplitPane');
var ScrollPane = require('substance/ui/ScrollPane');
var Layout = require('substance/ui/Layout');

function NoteWriter() {
  NoteWriter.super.apply(this, arguments);
}

NoteWriter.Prototype = function() {

  this.render = function($$) {
    var el = $$('div').addClass('sc-note-writer');

    var toolbar = this._renderToolbar($$);
    var editor = this._renderEditor($$);
    var cover = this._renderCover($$);

    var contentPanel = $$(ScrollPane, {
      scrollbarType: 'substance',
      scrollbarPosition: 'right'
    }).append(
      $$(Layout, {
        width: 'large'
      }).append(
        cover,
        editor
      )
    ).ref('contentPanel');

    var toolbarPane = $$('div').addClass('se-toolbar-wrapper').append(
      $$(Layout, {
        width: 'large',
        noPadding: true
      }).append(toolbar)
    );

    el.append(
      $$(SplitPane, {splitType: 'horizontal'}).append(
        toolbarPane,
        contentPanel
      )
    );
    return el;
  };

  this._renderEditor = function($$) {
    var configurator = this.props.configurator;
    return $$(ContainerEditor, {
      disabled: this.props.disabled,
      documentSession: this.documentSession,
      node: this.doc.get('body'),
      editing: 'full',
      commands: configurator.getSurfaceCommandNames(),
      textTypes: configurator.getTextTypes()
    }).ref('body');
  };

  this._renderCover = function($$) {
    var configurator = this.props.configurator;
    var componentRegistry = this.componentRegistry;
    var Cover = componentRegistry.get('cover');
    return $$(Cover, {
      doc: this.doc,
      configurator: configurator,
      mobile: this.props.mobile,
      editing: 'full',
      noteInfo: this.props.noteInfo,
      rubrics: this.props.rubrics
    }).ref('cover');
  };

};

ProseEditor.extend(NoteWriter);

module.exports = NoteWriter;