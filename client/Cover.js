"use strict";

var Component = require('substance/ui/Component');
var $$ = require('substance/ui/Component').$$;
var TextPropertyEditor = require('substance/ui/TextPropertyEditor');

var Cover = function() {
  Cover.super.apply(this, arguments);
};

Cover.Prototype = function() {

  this.render = function() {
    var doc = this.context.controller.getDocument();
    var config = this.context.config;

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
        $$('div').addClass('se-authors').append('Michael Aufreiter, Daniel Beilinson and 3 others')
      );
  };
};

Component.extend(Cover);

module.exports = Cover;