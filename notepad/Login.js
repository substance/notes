var Component = require('substance/ui/Component');
var $$ = Component.$$;

function Login() {
  Component.apply(this, arguments);

  this._state = {
    mode: 'login' // or 'signup' or 'signup-complete'
  };
}

Login.Prototype = function() {

  this._toggleSignup = function() {
    this._state.mode = 'signup';
    this.rerender();
  };

  this._login = function() {
    var loginKey = this.refs.loginKey.val();
    this.props.hubClient.authenticate({loginKey: loginKey}, function(err) {
      if (err) {
        return alert('Login failed. Please try again.');
      }
      this.props.onAuthenticated(this.props.hubClient.getSession());
    }.bind(this));
  };

  this._signup = function() {
    var name = this.refs.name.val();
    this.props.hubClient.signup({name: name}, function(err, loginKey) {
      if (err) {
        return alert('Signup failed. Please try again.');
      }
      this._state.loginKey = loginKey;
      this._state.mode = 'signup-complete';
      this.rerender();
    }.bind(this));
  };

  /*
    Finish signup
  */
  this._finishSignup = function() {
    this.props.onAuthenticated(this.props.hubClient.getSession());
  };

  this.render = function() {
    var el = $$('div').addClass('sc-login');

    if (this._state.mode === 'login') {
      // Login view
      el.append(
        $$('input').ref('loginKey').attr({placeholder: 'Enter Login Key'}),
        $$('button').on('click', this._login).append('Login')
      );
      el.append(
        'No account yet? ',
        $$('a').attr({href: '#'}).on('click', this._toggleSignup).append('Signup'),
        ' or use demo account with login key "1234".'
      );
    } else if (this._state.mode === 'signup') {
      // Signup view
      el.append(
        $$('input').ref('name').attr({placeholder: 'Enter your name'}),
        $$('button').on('click', this._signup).append('Signup')
      );
    } else {
      // Signup complete view
      el.append(
        $$('div').append('Your user has been created and a pass key has been generated for you.'),
        $$('div').append('Store your passkey safely. It can not be recovered. If you loose it you have to create a new account.'),
        $$('div').append(
          'PassKey:',
          this._state.loginKey
        ),
        $$('button').on('click', this._finishSignup).append('Finish Signup')
      );
    }
    return el;
  };
};

Component.extend(Login);

module.exports = Login;