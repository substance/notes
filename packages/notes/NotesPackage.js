'use strict';

var NoteLoader = require('../note-loader/NoteLoaderPackage');
var NoteReader = require('../note-reader/NoteReaderPackage');
var NoteWriter = require('../note-writer/NoteWriterPackage');
var NoteCover = require('../note-cover/NoteCoverPackage');

module.exports = {
  name: 'notes',
  configure: function(config) {
    config.import(NoteLoader);
    config.import(NoteReader);
    config.import(NoteWriter);
    config.import(NoteCover);
    config.addLabel('sc-welcome.brand', '<div class="se-brand">Substance <span class="sc-brand-strong">Notes</span></div>');
    config.addLabel('sc-welcome.title', 'Substance Notes');
    config.addLabel('sc-welcome.about', 'Substance Notes is an open source collaborative notes editing tool. You can write documents, comments, upload images and have your friends join in when you want their input. Joining the writing session is easy, all your friends need is your Note’s URL, and they can write away!');
    config.addLabel('sc-welcome.no-passwords', 'No passwords, just email');
    config.addLabel('sc-welcome.howto-login', 'A Substance Notes account just needs an e-mail address, so we can send you a link to your dashboard with a one-time login key. There’s no need to remember a password — as long as you have access to your e-mail, you’ll have access to your Notes.');
    config.addLabel('sc-welcome.enter-email', 'Interested? Enter your email below and get access to the beta.');
    config.addLabel('sc-welcome.submit', 'Request login');
    config.addLabel('sc-welcome.submitted-title', 'Thank you!');
    config.addLabel('sc-welcome.submitted-instructions', 'We have sent an email to you containing a secret link to access your dashboard.');
  }
};