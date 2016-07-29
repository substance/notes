'use strict';

var Component = require('substance/ui/Component');
var isUndefined = require('lodash/isUndefined');

function Notification() {
  Component.apply(this, arguments);
}

Notification.Prototype = function() {

  this.render = function($$) {
    if(isUndefined(this.props.type)) {
      var emptyEl = $$('div').addClass('sc-empty-notification');
      return emptyEl;
    }

    var el = $$('div').addClass('sc-notification se-type-' + this.props.type);
    el.append(this.props.message);
    return el;
  };
};

Component.extend(Notification);

module.exports = Notification;