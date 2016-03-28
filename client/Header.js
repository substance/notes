var Component = require('substance/ui/Component');
var LoginStatus = require('./LoginStatus');

var $$ = Component.$$;

function Header() {
  Component.apply(this, arguments);
}

Header.Prototype = function() {

  this.render = function() {
    var authenticationClient = this.context.authenticationClient;
    var el = $$('div').addClass('sc-header');

    var actions = [];
    if (this.props.actions) {
      actions = actions.concat(this.props.actions);
    }

    var content = [];
    if (this.props.content) {
      content = content.concat(this.props.content);
    }

    el.append(
      $$('div').addClass('se-actions').append(actions),
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