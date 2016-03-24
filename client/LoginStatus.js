var Component = require('substance/ui/Component');
var $$ = Component.$$;

function LoginStatus() {
  Component.apply(this, arguments);
}

LoginStatus.Prototype = function() {

  this._logout = function() {
    this.send('logout');
  };

  this.render = function() {
    var el = $$('div').addClass('sc-login-status se-dropdown');
    el.append(
      this.props.user.name,
      $$('span').addClass('se-caret fa fa-caret-down')
    );
    el.append($$('ul').append(
      $$('li').on('click', this._logout).append('Logout')
    ));
    return el;
  };
};

Component.extend(LoginStatus);

module.exports = LoginStatus;