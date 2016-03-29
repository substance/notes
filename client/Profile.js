var Header = require('./Header');
var Component = require('substance/ui/Component');
var Notification = require('./Notification');
var Icon = require('substance/ui/FontAwesomeIcon');
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

    var profile = $$('div').addClass('se-profile-contents').append(
      $$('div').addClass('se-intro')
        .html('<h1>Welcome to Substance Notes<span class="se-cursor"></span></h1>')
    );

    if (this.state.notification) {
      profile.append($$(Notification, this.state.notification));
    }

    var requestForm = $$('div').addClass('se-enter-name');
    requestForm.append(
      $$('input')
          .attr({type: 'text', placeholder: 'Please enter your name here', value: userName})
          .ref('name'),
      $$('p').addClass('help').append('Your name will show up along with notes you worked on. You can change it later via the user menu.'),

      $$('button').addClass('sg-confirm-button se-action se-new-note').append(
        $$(Icon, {icon: 'fa-long-arrow-right'}),
        ' Continue'
      )
        .on('click', this._updateUserName)
    );
    profile.append(requestForm);

    el.append(
      header,
      profile
    );
    return el;
  };
};

Component.extend(Profile);

module.exports = Profile;