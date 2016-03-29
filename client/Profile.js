var Header = require('./Header');
var Component = require('substance/ui/Component');
var $$ = Component.$$;

function Profile() {
  Component.apply(this, arguments);
}

Profile.Prototype = function() {

  this.updateUserName = function() {
    var self = this;
    var name = this.refs.name.val();
    var authenticationClient = this.context.authenticationClient;
    var user = authenticationClient.getUser();
    authenticationClient.changeName(user.userId, name, function(err) {
      if(err) {
        //handelerrror;
      }
      self.rerender();
    });
  };

  this.getUserName = function() {
    var authenticationClient = this.context.authenticationClient;
    var user = authenticationClient.getUser();
    return user.name;
  };

  this.render = function() {
    var el = $$('div').addClass('sc-profile');
    var userName = this.getUserName() || 'Anonymous';
    var header = $$(Header);

    var profile = $$('div').addClass('se-profile-contents').append(
      $$('div').addClass('se-intro').html(this.i18n.t('sc-profile.intro'))
    );

    // Enter email
    var requestForm = $$('div').addClass('se-enter-name');
    requestForm.append(
      $$('input')
          .attr({type: 'text', placeholder: 'Enter your name here', value: userName})
          .on('change', this.updateUserName)
          .ref('name'),
      $$('p').addClass('help').append('This is the user name we’ll use when you work on Notes. You can change it now, or later via the user menu of the Notes editor.'),
      $$('button').addClass('se-action se-new-note').on('click', this.send.bind(this, 'newNote')).append('Create new Note')
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