'use strict';

var Component = require('substance/ui/Component');
var Layout = require('substance/ui/Layout');
var RequestLogin = require('./RequestLogin');

function Welcome() {
  Component.apply(this, arguments);

  this.handleActions({
    'loginRequested': this._loginRequested
  });
}

Welcome.Prototype = function() {

  this.render = function($$) {
    var el = $$('div').addClass('sc-welcome');

    // Topbar with branding
    el.append(
      $$('div').addClass('se-topbar').html('')
    );

    var layout = $$(Layout, {
      width: 'medium',
      textAlign: 'center'
    });

    if (this.state.requested) {
      layout.append(
        $$('h1').append(this.getLabel('welcome-title')),
        $$('p').append(this.getLabel('welcome-instructions'))
      );
    } else {
      layout.append(
        $$('h1').append(
          this.getLabel('welcome-title'),
          $$('span').addClass('se-cursor')
        ),
        $$('p').append(this.getLabel('welcome-about')),
        $$('h2').append(this.getLabel('welcome-no-passwords')),
        $$('p').html(this.getLabel('welcome-howto-login')),
        $$('p').append(this.getLabel('welcome-enter-email'))
      );

      layout.append(
        $$(RequestLogin)
      );
    }

    el.append(layout);
    return el;
  };

  this._loginRequested = function() {
    this.setState({requested: true});
  };
};

Component.extend(Welcome);

module.exports = Welcome;