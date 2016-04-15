'use strict';

var Component = require('substance/ui/Component');

var Dashboard = require('./Dashboard');
var Welcome = require('./Welcome');
var EnterName = require('./Profile');

function IndexSection() {
  Component.apply(this, arguments);
}

IndexSection.Prototype = function() {
  this.render = function($$) {
    var el = $$('div').addClass('sc-index-section');
    var userSession = this.props.userSession;

    if (!userSession) {
      el.append($$(Welcome).ref('welcome'));
    } else if (userSession.user.name) {
      el.append($$(Dashboard, this.props).ref('dashboard'));
    } else {
      el.append($$(EnterName, this.props).ref('enterName'));
    }
    return el;
  };
};

Component.extend(IndexSection);

module.exports = IndexSection;