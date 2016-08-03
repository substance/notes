'use strict';

var Component = require('substance/ui/Component');
var TextPropertyEditor = require('substance/ui/TextPropertyEditor');
var Summary = require('./Summary');

function Cover() {
  Cover.super.apply(this, arguments);
}

Cover.Prototype = function() {

  this.didMount = function() {
    var doc = this.getDocument();
    doc.on('document:changed', this._onDocumentChanged, this);
  };

  this.dispose = function() {
    var doc = this.getDocument();
    doc.off(this);
  };

  this.render = function($$) {
    var configurator = this.props.configurator;
    var doc = this.getDocument();
    var noteInfo = this.props.noteInfo.props;
    var authors = [noteInfo.author || noteInfo.userId];

    authors = authors.concat(noteInfo.collaborators);
    var metaNode = doc.getDocumentMeta();
    return $$("div").addClass("sc-cover")
      .append(
        // Editable title
        $$(TextPropertyEditor, {
          name: 'title',
          tagName: "div",
          disabled: this.props.disabled,
          commands: configurator.getSurfaceCommandNames(),
          path: [metaNode.id, "title"],
          editing: this.props.editing || 'full'
        }).addClass('se-title'),
        $$('div').addClass('se-separator'),
        $$('div').addClass('se-authors').append(authors.join(', ')),
        $$(Summary, {
          mobile: this.props.mobile,
          noteInfo: this.props.noteInfo
        })
      );
  };

  this._onDocumentChanged = function(change) {
    // Only rerender if changed happened outside of the title surface.
    // Otherwise we would destroy the current selection
    
    // HACK: update the updatedAt property
    this.props.noteInfo.props.updatedAt = new Date();

    if (change.after && change.after.surfaceId !== 'title') {
      this.rerender();
    }
  };

  this.getDocument = function() {
    return this.props.doc;
  };
};

Component.extend(Cover);

module.exports = Cover;