"use strict";

var Component = require('substance/ui/Component');
var $$ = require('substance/ui/Component').$$;
var TextPropertyEditor = require('substance/ui/TextPropertyEditor');
var Icon = require('substance/ui/FontAwesomeIcon');
var filter = require('lodash/filter');
var size = require('lodash/size');

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

  this.render = function() {
    var doc = this.context.controller.getDocument();
    var config = this.context.config;
    var noteInfo = this.props.noteInfo.props;
    var updatedAt = new Date(noteInfo.updatedAt).toDateString();

    var authors = [noteInfo.author || noteInfo.userId];
    authors = authors.concat(noteInfo.collaborators);
    
    console.log('noteInfo', noteInfo);

    var commentsQt = size(doc.getIndex('type').get('comment'));
    var commentsLabel = commentsQt == 1 ? 'comment' : 'comments';
    var issueIndex = doc.getIndex('type').get('todo');
    var issuesQt = size(issueIndex);
    var resolvedQt = size(filter(issueIndex, function(i){return i.done;}));
    var metaNode = doc.getDocumentMeta();

    return $$("div").addClass("sc-cover")
      .append(
        // Editable title
        $$(TextPropertyEditor, {
          name: 'title',
          tagName: "div",
          commands: config.titleEditor.commands,
          path: [metaNode.id, "title"],
          editing: 'full'
        }).addClass('se-title'),
        $$('div').addClass('se-separator'),
        $$('div').addClass('se-authors').append(authors.join(', ')),
        $$('div').addClass('se-info-panel').append(
          $$('div').addClass('se-comments').append(
            $$(Icon, {icon: "fa-comment-o"}),
            commentsQt + ' ' + commentsLabel
          ),
          $$('div').addClass('se-separator'),
          $$('div').addClass('se-issues').append(
            $$(Icon, {icon: "fa-check-square-o"}),
            $$('div').addClass('issues-bar').append(
              $$('span').addClass('completed').setAttribute('style', 'width: ' + resolvedQt/issuesQt*100 + '%')
            ),
            resolvedQt + ' of ' + issuesQt
          ),
          $$('div').addClass('se-separator'),
          $$('div').addClass('se-changed').append('Updated on ', updatedAt, ' by ', noteInfo.updatedBy)
        )
      );
  };

};

Component.extend(Cover);

module.exports = Cover;