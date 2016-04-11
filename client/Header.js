'use strict';

var Component = require('substance/ui/Component');
var LoginStatus = require('./LoginStatus');
var forEach = require('lodash/forEach');

function Header() {
  Component.apply(this, arguments);
}

Header.Prototype = function() {

  this.render = function($$) {
    var authenticationClient = this.context.authenticationClient;
    var el = $$('div').addClass('sc-header');
    var actionEls = [];

    if (this.props.actions) {
      forEach(this.props.actions, function(label, actionName) {
        actionEls.push(
          $$('button').addClass('se-action')
            .append(label)
            .on('click', this.send.bind(this, actionName))
        );
      }.bind(this));
    }

    var content = [];
    if (this.props.content) {
      content = content.concat(this.props.content);
    }

    el.append(
      $$('div').addClass('se-actions').append(actionEls),
      $$(LoginStatus, {
        user: authenticationClient.getUser()
      }),
      $$('div').addClass('se-content').append(content)
    );
    return el;
  };
};

Component.extend(Header);
module.exports = Header;