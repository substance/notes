'use strict';

var Component = require('substance/ui/Component');
var Input = require('substance/ui/Input');
var Button = require('substance/ui/Button');
var Layout = require('substance/ui/Layout');

function EnterName() {
  Component.apply(this, arguments);
}

EnterName.Prototype = function() {

  this.render = function($$) {
    var authenticationClient = this.context.authenticationClient;
    var componentRegistry = this.context.componentRegistry;
    var LoginStatus = this.context.componentRegistry.get('login-status');
    var Notification = componentRegistry.get('notification');
    var Header = componentRegistry.get('header');

    var el = $$('div').addClass('sc-enter-name');
    var userName = this.props.userSession.user.name;

    var header = $$(Header, {
      actions: {
        'dashboard': 'My Notes'
      }
    });

    header.outlet('content').append(
      $$(LoginStatus, {
        user: authenticationClient.getUser()
      })
    );

    var form = $$(Layout, {
      width: 'medium',
      textAlign: 'center'
    });

    // If no username present yet
    if (!userName) {
      form.append(
        $$('h1').html(
          this.getLabel('enter-name-welcome')
        )
      );
    } else {
      form.append(
        $$('h1').html(
          this.getLabel('enter-name-settings')
        )
      );
    }


    if (this.state.notification) {
      form.append($$(Notification, this.state.notification));
    }

    form.append(
      $$('div').addClass('se-enter-name').append(
        $$(Input, {
          type: 'text',
          value: userName || '',
          placeholder: this.getLabel('enter-name-placeholder'),
          centered: true
        }).ref('name')
      ),
      $$('p').addClass('se-help').append(
        this.getLabel('enter-name-help')
      )
    );

    form.append(
      $$(Button, {
        disabled: Boolean(this.state.loading) // disable button when in loading state
      }).append(
        this.context.iconProvider.renderIcon($$, 'welcome-continue'),
        this.getLabel('enter-name-continue')
      )
      .on('click', this._updateUserName)
    );

    el.append(
      header,
      form
    );
    return el;
  };

  this._updateUserName = function() {
    var name = this.refs.name.val();
    var authenticationClient = this.context.authenticationClient;
    var userSession = this.props.userSession;

    if (!name) {
      this.setState({
        notification: {
          type: 'error',
          message: 'Please provide a name.'
        }
      });
    }

    authenticationClient.changeName(userSession.user.userId, name, function(err) {
      if(err) {
        this.setState({
          notification: {
            type: 'error',
            message: this.getLabel(err.name)
          }
        });
        return;
      }

      userSession.user.name = name;
      this.send('userSessionUpdated', userSession);
    }.bind(this));
  };

};

Component.extend(EnterName);

module.exports = EnterName;