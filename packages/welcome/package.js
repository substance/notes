'use strict';

var Welcome = require('./Welcome');
var LoginStatus = require('./LoginStatus');
var EnterName = require('./EnterName');
var RequestEditAccess = require('./RequestEditAccess');

module.exports = {
  name: 'welcome',
  configure: function(config) {
    config.addComponent('welcome', Welcome);
    config.addComponent('login-status', LoginStatus);
    config.addComponent('enter-name', EnterName);
    config.addComponent('request-edit', RequestEditAccess);
    config.addStyle(__dirname, '_welcome');
    config.addStyle(__dirname, '_request-login');
    config.addStyle(__dirname, '_login-status');

    config.addLabel('welcome-title', {
      en: 'Substance Notes'
    });
    config.addLabel('welcome-about', {
      en: 'Substance Notes is an open source collaborative notes editing tool. You can write documents, comments, upload images and have your friends join in when you want their input. Joining the writing session is easy, all your friends need is your Note’s URL, and they can write away!',
    });
    config.addLabel('welcome-no-passwords', {
      en: 'No passwords, just email'
    });
    config.addLabel('welcome-howto-login', {
      en: 'A Substance Notes account just needs an e-mail address, so we can send you a link to your dashboard with a one-time login key. There’s no need to remember a password — as long as you have access to your e-mail, you’ll have access to your Notes.'
    });
    config.addLabel('welcome-enter-email', {
      en: 'Interested? Enter your email below and get access to the beta.'
    });
    config.addLabel('welcome-submit', {
      en: 'Request login'
    });
  }
};