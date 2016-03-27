'use strict';

var Component = require('substance/ui/Component');
var $$ = Component.$$;
var TextProperty = require('substance/ui/TextPropertyComponent');
var Icon = require('substance/ui/FontAwesomeIcon');

function CommentComponent() {
  Component.apply(this, arguments);
}

CommentComponent.Prototype = function() {

  this.getClassNames = function() {
    return 'sc-comment';
  };

  this.getDate = function() {
    var date = this.props.node.createdAt;
    var result = this.timeSince(new Date(date)) + ' ago';
    return result;
  };

  this.render = function() {
    var author = this.props.node.author;
    var date = new Date(this.props.node.createdAt).toDateString();
    var authored = '<strong>'+author+'</strong>' + ' ' + date;

    return $$('div')
      .addClass(this.getClassNames())
      .attr("data-id", this.props.node.id)
      .append(
        $$('div')
          .addClass('se-comment-symbol')
          .attr({contenteditable: false}).append(
            $$(Icon, {icon: "fa-comment"})
          ),
        $$('div')
          .addClass('se-authored')
          .attr('contenteditable', false)
          .html(authored),
        $$('div').addClass('se-body').append(
          $$(TextProperty, {
            doc: this.props.node.getDocument(),
            path: [ this.props.node.id, "content"],
          })          
        )
      );
  };
};

Component.extend(CommentComponent);

module.exports = CommentComponent;
