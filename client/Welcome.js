var Component = require('substance/ui/Component');
var $$ = Component.$$;

function Welcome() {
  Component.apply(this, arguments);
}

Welcome.Prototype = function() {

  /*
    Send Dashboard link including one-time loginKey
  */
  this._sendEmail = function(email) {
    var authenticationClient = this.context.authenticationClient;
    authenticationClient.requestLoginLink(email, function(err, res) {
      console.log('Email link requested', res);
    });
  };

  this._requestLoginLink = function() {
    var email = this.refs.email.val();
    this.setState({
      requested: true
    });
    this._sendEmail(email);
  };

  this.render = function() {
    var el = $$('div').addClass('sc-welcome');
    
    // Topbar with branding
    el.append(
      $$('div').addClass('se-topbar').html('')
    );

    // Intro
    el.append(
      $$('div').addClass('se-brand-wrapper').html(this.i18n.t('sc-welcome.brand')),
      $$('div').addClass('se-intro').html(this.i18n.t('sc-welcome.intro'))
    );

    // Enter email
    var requestForm = $$('div').addClass('se-enter-email');
    requestForm.append(
      $$('input')
          .attr({type: 'email', placeholder: 'Enter your email here'})
          .ref('email')
    );
    var requestButton = $$('button').addClass('se-send-email');
    if(this.state.requested) {
      requestButton.append('Checkout email, we just sent a link to you!');
    } else {
      requestButton
        .append('Start writing!')
        .on('click', this._requestLoginLink);
    }
    requestForm.append(requestButton);
    el.append(requestForm);
    return el;
  };
};

Component.extend(Welcome);

module.exports = Welcome;


