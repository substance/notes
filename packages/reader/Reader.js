'use strict';

var ProseEditor = require('substance/packages/prose-editor/ProseEditor');
var ContainerEditor = require('substance/ui/ContainerEditor');

function Reader() {
  Reader.super.apply(this, arguments);
}

Reader.Prototype = function() {

  this.render = function($$) {
    var el = $$('div').addClass('sc-notepad');

    var editor = this._renderEditor($$);
    var cover = this._renderCover($$);

    var contentPanel = $$('div').addClass('se-note-content').append(
      cover,
      editor
    ).ref('contentPanel');

    el.append(contentPanel);
    return el;
  };

  this._renderEditor = function($$) {
    var configurator = this.props.configurator;
    return $$(ContainerEditor, {
      disabled: this.props.disabled,
      documentSession: this.documentSession,
      node: this.doc.get('body'),
      editing: 'readonly',
      commands: configurator.getSurfaceCommandNames(),
      textTypes: configurator.getTextTypes()
    }).ref('body');
  };

  this._renderCover = function($$) {
    var configurator = this.props.configurator;
    var componentRegistry = this.componentRegistry;
    var Cover = componentRegistry.get('cover');
    return $$(Cover, {
      disabled: this.props.disabled,
      doc: this.doc,
      mobile: this.props.mobile,
      configurator: configurator,
      editing: 'readonly',
      noteInfo: this.props.noteInfo,
      rubrics: this.props.rubrics
    }).ref('cover');
  };

};

ProseEditor.extend(Reader);

module.exports = Reader;