'use strict';

var Component = require('substance/ui/Component');
var $$ = Component.$$;
var TextProperty = require('substance/ui/TextPropertyComponent');
var Icon = require('substance/ui/FontAwesomeIcon');

function CommentProperty() {
  TextProperty.apply(this, arguments);
}

CommentProperty.Prototype = function() {
  this.render = function() {
    var path = this.props.path;
    var author = this.getAuthor();
    var date = this.getDate();
    var authored = ' - ' + author + ' ' + date;

    var el = this._renderContent()
      .addClass('sc-text-property')
      .attr({
        "data-path": path.join('.'),
        spellCheck: false,
      })
      .css({
        whiteSpace: "pre-wrap"
      });

    var commentIcon = $$('span').addClass('sc-comment-symbol').attr({contenteditable: false}).append(
      $$(Icon, {icon: "fa-comment"})
    );
    el.append(commentIcon);

    // Should be non-editable, if we can't there is css-after way
    el.append($$('span')
      .addClass('sc-authored')
      .attr('data-length', authored.length)
      .attr('contenteditable', false)
      .append(authored));
    el.append($$('br'));
    return el;
  };

  this.getAuthor = function() {
    var doc = this.getDocument();
    return doc.get(this.props.author);
  };

  this.getDate = function() {
    var doc = this.getDocument();
    var date = doc.get(this.props.date);
    var result = this.timeSince(new Date(date)) + ' ago';
    return result;
  };

  this.timeSince = function(date) {
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  };
};

TextProperty.extend(CommentProperty);

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
      .append($$(CommentProperty, {
        path: [ this.props.node.id, "content"],
        author: [ this.props.node.id, "author"],
        date: [ this.props.node.id, "date"]
      }));
  };
};

Component.extend(CommentComponent);

module.exports = CommentComponent;
