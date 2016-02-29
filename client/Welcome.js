var Component = require('substance/ui/Component');
var $$ = Component.$$;

function Welcome() {
  Component.apply(this, arguments);
}

Welcome.Prototype = function() {

  /*
    Send Dashboard link including one-time loginKey
  */
  this._sendEmail = function() {
    console.log('send email');
  };

  this.render = function() {
    var el = $$('div').addClass('sc-welcome');
    
    // Intro
    el.append(
      $$('div').addClass('se-intro').html(this.i18n.t('sc-welcome.intro'))
    );

    // Enter email
    el.append(
      $$('div').addClass('se-enter-email').append(
        $$('input')
          .attr({type: 'email', placeholder: 'Enter your email here'})
          .ref('email'),
        $$('button').addClass('se-send-email')
          .append('Start writing!')
          .on('click', this._sendEmail)
      )
    );
    return el;
  };
};

Component.extend(Welcome);

module.exports = Welcome;


