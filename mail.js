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
    from: 'Susbtance Notes ✍ <notes@substance.io>',
    to: to,
    subject: subject,
    text: content
  };

  transporter.sendMail(message, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Sent: ' + info.response);
    }
  });
};

module.exports = Mail;