var Header = require('./Header');
var Component = require('substance/ui/Component');
var Notification = require('./Notification');
var Icon = require('substance/ui/FontAwesomeIcon');
var Input = require('substance/ui/Input');
var Button = require('substance/ui/Button');
var Layout = require('substance/ui/Layout');

var $$ = Component.$$;

function Profile() {
  Component.apply(this, arguments);
}

Profile.Prototype = function() {

  this._updateUserName = function() {
    var name = this.refs.name.val();
    var authenticationClient = this.context.authenticationClient;
    var user = authenticationClient.getUser();

    if (!name) {
      this.setState({
        notification: {
          type: 'error',
          message: 'Please provide a name.'
        }
      });      
    }

    authenticationClient.changeName(user.userId, name, function(err) {
      if(err) {
        this.setState({
          notification: {
            type: 'error',
            message: 'Please provide a name.'
          }
        });
        return;
      }
      this.send('openDashboard');
    }.bind(this));
  };

  this.getUserName = function() {
    var authenticationClient = this.context.authenticationClient;
    var user = authenticationClient.getUser();
    return user.name;
  };

  this.render = function() {
    var el = $$('div').addClass('sc-profile');
    var userName = this.getUserName();
    var header = $$(Header);

    header.outlet('actions').append(
      $$('button').addClass('se-action').append('Dashboard').on('click', this.send.bind(this, 'openDashboard')),
      $$('button').addClass('se-action').append('New Note').on('click', this.send.bind(this, 'newNote'))
    );

    var form = $$(Layout, {
      width: 'medium',
      type: 'centered'
    });

    form.append(
      $$('h1').html(
        'Welcome to Substance Notes<span class="se-cursor"></span>'
      )
    );

    if (this.state.notification) {
      form.append($$(Notification, this.state.notification));
    }

    form.append(
      $$('div').addClass('se-enter-name').append(
        $$(Input, {
          type: 'text',
          value: userName,
          placeholder: 'Please enter your name here',
          centered: true
        }).ref('name')
      ),
      $$('p').addClass('se-help').append(
        'Your name will show up along with notes you worked on. You can change it later via the user menu.'
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
};

Component.extend(Profile);

module.exports = Profile;