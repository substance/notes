'use strict';

var Header = require('./Header');
var Component = require('substance/ui/Component');
var Notification = require('./Notification');
var Icon = require('substance/ui/FontAwesomeIcon');
var Input = require('substance/ui/Input');
var Button = require('substance/ui/Button');
var Layout = require('substance/ui/Layout');

function EnterName() {
  Component.apply(this, arguments);
}

EnterName.Prototype = function() {

  this.render = function($$) {
    var el = $$('div').addClass('sc-enter-name');
    var userName = this.props.userSession.user.name;

    var header = $$(Header, {
      actions: {
        'home': 'My Notes'
      }
    });

    var form = $$(Layout, {
      width: 'medium',
      textAlign: 'center'
    });

    // If no username present yet
    if (!userName) {
      form.append(
        $$('h1').html(
          'Welcome to Substance Notes'
        )
      );
    } else {
      form.append(
        $$('h1').html(
          'Please provide your name'
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
          placeholder: 'Please enter your name here',
          centered: true
        }).ref('name')
      ),
      $$('p').addClass('se-help').append(
        'Your name will show up along with notes you worked on. You can change it any time via the user menu.'
      )
    );

    form.append(
      $$(Button, {
        disabled: !!this.state.loading // disable button when in loading state
      }).append(
         $$(Icon, {icon: 'fa-long-arrow-right'}),
         ' Continue'
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
            message: this.i18n(err.name)
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