'use strict';

var config = require('config');
var nodemailer = require('nodemailer');

var Mail = {};

var sender = config.get('mail.sender');
var mailgunCredentials = {
  user: config.get('mail.mailgun.user'),
  pass: config.get('mail.mailgun.pass')
};

Mail.sendPlain = function(to, subject, content) {

  var transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: mailgunCredentials
  });

  var message = {
    from: sender,
    to: to,
    subject: subject,
    text: content
  };

  return transporter.sendMail(message);
};

module.exports = Mail;