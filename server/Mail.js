var nodemailer = require('nodemailer');

var Mail = {};

var sender = process.env.MAIL_SENDER || 'Substance Notes ✍ <notes@substance.io>';
var mailgunCredentials = {
  user: process.env.MAILGUN_USER || "postmaster@sandbox84c5489455f344aab63a03a1816820de.mailgun.org",
  pass: process.env.MAILGUN_PASS || "40e89d2acafe9ae3f56e0a6bd97bf731"
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