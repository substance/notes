var nodemailer = require('nodemailer');

var Mail = {};

Mail.sendPlain = function(to, subject, content) {

  var transporter = nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
      user: "postmaster@sandbox84c5489455f344aab63a03a1816820de.mailgun.org",
      pass: "40e89d2acafe9ae3f56e0a6bd97bf731"
    }
  });

  var message = {
    from: 'Substance Notes ✍ <notes@substance.io>',
    to: to,
    subject: subject,
    text: content
  };

  return transporter.sendMail(message);
};

module.exports = Mail;