var Component = require('substance/ui/Component');
var Button = require('substance/ui/Button');
var Input = require('substance/ui/Input');
var Layout = require('substance/ui/Layout');
var Notification = require('./Notification');

var $$ = Component.$$;

function Welcome() {
  Component.apply(this, arguments);
}

Welcome.Prototype = function() {

  this._requestLoginLink = function() {
    var email = this.refs.email.val();
    var authenticationClient = this.context.authenticationClient;

    // Set loading state
    this.setState({
      email: email,
      loading: true
    });

    authenticationClient.requestLoginLink(email, function(err) {
      if (err) {
        this.setState({
          loading: false,
          notification: {
            type: 'error',
            message: 'Your request could not be processed. Make sure you provided a valid email.'
          }
        });
      } else {
        this.setState({
          loading: false,
          requested: true
        });
      }
    }.bind(this));
  };


  this.render = function() {
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
        $$('h1').append(this.i18n.t('sc-welcome.submitted-title')),
        $$('p').append(this.i18n.t('sc-welcome.submitted-instructions'))
      );
    } else {
      layout.append(
        $$('h1').append(
          this.i18n.t('sc-welcome.title'),
          $$('span').addClass('se-cursor')
        ),
        $$('p').append(this.i18n.t('sc-welcome.about')),
        $$('h2').append(this.i18n.t('sc-welcome.no-passwords')),
        $$('p').append(this.i18n.t('sc-welcome.howto-login')),
        $$('p').append(this.i18n.t('sc-welcome.enter-email'))
      );

      layout.append(
        $$('div').addClass('se-email').append(
          $$(Input, {
            type: 'text',
            value: this.state.email,
            placeholder: 'Enter your email here',
            centered: true
          }).ref('email')
        )
      );

      layout.append(
        $$(Button, {
          disabled: !!this.state.loading // disable button when in loading state
        }).append(this.i18n.t('sc-welcome.submit'))
          .on('click', this._requestLoginLink)
      );

      if (this.state.notification) {
        layout.append($$(Notification, this.state.notification));
      }
    }
    
    el.append(layout);
    return el;
  };
};

Component.extend(Welcome);

module.exports = Welcome;