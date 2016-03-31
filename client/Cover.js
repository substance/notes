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

  this.render = function() {
    var doc = this.context.controller.getDocument();
    var config = this.context.config;
    var noteInfo = this.props.noteInfo.props;
    var updatedAt = new Date(noteInfo.updatedAt).toDateString();

    var authors = [noteInfo.author || noteInfo.userId];
    authors = authors.concat(noteInfo.collaborators.split(','));
    
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
        $$('div').addClass('se-comments').append(
          $$(Icon, {icon: "fa-comment-o"}),
          commentsQt + ' ' + commentsLabel
        ),
        $$('div').addClass('se-issues').append(
          $$(Icon, {icon: "fa-check-square-o"}),
          resolvedQt + ' of ' + issuesQt
        ),
        $$('div').addClass('se-authors').append('Updated on ', updatedAt, ' by ', noteInfo.updatedBy)
      );
  };
};

Component.extend(Cover);

module.exports = Cover;