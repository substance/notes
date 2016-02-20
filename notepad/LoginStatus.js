var Component = require('substance/ui/Component');
var forEach = require('lodash/forEach');
var $$ = Component.$$;

function LoginStatus() {
  Component.apply(this, arguments);
}

LoginStatus.Prototype = function() {

  this._logout = function() {
    this.send('logout');
  };

  this.render = function() {
    var el = $$('div').addClass('sc-login-status');
    el.append(this.props.user.name);
    el.append($$('button').on('click', this._logout).append('Logout'));
    return el;
  };
};

Component.extend(LoginStatus);

module.exports = LoginStatus;