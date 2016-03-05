'use strict';

var Component = require('substance/ui/Component');
var $$ = Component.$$;
var TextProperty = require('substance/ui/TextPropertyComponent');

function CommentComponent() {
  Component.apply(this, arguments);
}

CommentComponent.Prototype = function() {

  this.getClassNames = function() {
    return 'sc-comment';
  };

  this.render = function() {
    return $$('div')
      .addClass(this.getClassNames())
      .attr("data-id", this.props.node.id)
      .append($$(TextProperty, {
        path: [ this.props.node.id, "content"]
      }));
  };
};

Component.extend(CommentComponent);

module.exports = CommentComponent;
