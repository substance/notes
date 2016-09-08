'use strict';

var Component = require('substance/ui/Component');
var Button = require('substance/ui/Button');
var Input = require('substance/ui/Input');

function RequestLogin() {
  Component.apply(this, arguments);
}

RequestLogin.Prototype = function() {

  this.render = function($$) {
    var componentRegistry = this.context.componentRegistry;
    var Notification = componentRegistry.get('notification');

    var el = $$('div').addClass('sc-request-login');

    if (this.state.requested) {
      el.append(
        $$('h1').append(this.i18n.t('sc-welcome.submitted-title')),
        $$('p').append(this.i18n.t('sc-welcome.submitted-instructions'))
      );
    } else {
      el.append(
        $$('div').addClass('se-email').append(
          $$(Input, {
            type: 'text',
            value: this.state.email,
            placeholder: 'Enter your email here',
            centered: true
          }).ref('email')
        )
      );

      el.append(
        $$(Button, {
          disabled: Boolean(this.state.loading) // disable button when in loading state
        }).append(this.getLabel('welcome-submit'))
          .on('click', this._requestLoginLink)
      );

      if (this.state.notification) {
        el.append($$(Notification, this.state.notification));
      }
    }
    return el;
  };

  this._requestLoginLink = function() {
    var email = this.refs.email.val();
    var authenticationClient = this.context.authenticationClient;

    // Set loading state
    this.setState({
      email: email,
      loading: true
    });

    authenticationClient.requestLoginLink({
      email: email,
      documentId: this.props.documentId
    }, function(err) {
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
        this.send('loginRequested');
      }
    }.bind(this));
  };
};

Component.extend(RequestLogin);
module.exports = RequestLogin;