'use strict';

var Component = require('substance/ui/Component');
var TextPropertyEditor = require('substance/ui/TextPropertyEditor');
var NoteSummary = require('./NoteSummary');

var Cover = function() {
  Cover.super.apply(this, arguments);
};

Cover.Prototype = function() {

  this.initialize = function() {
    var doc = this.context.controller.getDocument();
    doc.on('document:changed', this._onDocumentChanged, this);
  };

  this._onDocumentChanged = function(change) {
    // Only rerender if changed happened outside of the title surface.
    // Otherwise we would destroy the current selection
    if (change.after && change.after.surfaceId !== 'title') {
      this.rerender();
    }
  };

  this.dispose = function() {
    var doc = this.context.controller.getDocument();
    doc.off(this);
  };

  this.render = function($$) {
    var doc = this.context.controller.getDocument();
    var config = this.context.config;
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
          commands: config.titleEditor.commands,
          path: [metaNode.id, "title"],
          editing: this.props.editing || 'full'
        }).addClass('se-title'),
        $$('div').addClass('se-separator'),
        $$('div').addClass('se-authors').append(authors.join(', ')),
        $$(NoteSummary, {
          mobile: this.props.mobile,
          noteInfo: this.props.noteInfo
        })
      );
  };
};

Component.extend(Cover);

module.exports = Cover;