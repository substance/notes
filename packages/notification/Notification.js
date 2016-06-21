'use strict';

var Component = require('substance/ui/Component');

function Notification() {
  Component.apply(this, arguments);
}

Notification.Prototype = function() {

  this.render = function($$) {
    var el = $$('div').addClass('sc-notification se-type-' + this.props.type);
    el.append(this.props.message);
    return el;
  };
};

Component.extend(Notification);

module.exports = Notification;