'use strict';

var Component = require('substance/ui/Component');

function LoginStatus() {
  Component.apply(this, arguments);
}

LoginStatus.Prototype = function() {

  this.render = function($$) {
    var user = this.props.user;
    var name = user.name || 'Anonymous';
    var el = $$('div').addClass('sc-login-status se-dropdown');
    el.append(
      name,
      $$('span').addClass('se-caret fa fa-caret-down')
    );
    el.append($$('ul').append(
      $$('li').on('click', this._openUserSettings).append('Settings'),
      $$('li').on('click', this._logout).append('Logout')
    ));
    return el;
  };

  this._logout = function() {
    this.send('logout');
  };

  this._openUserSettings = function() {
    this.send('settings');
  };

};

Component.extend(LoginStatus);

module.exports = LoginStatus;