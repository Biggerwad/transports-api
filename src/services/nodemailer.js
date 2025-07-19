const fs = require('fs');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');

dotenv.config();

// Content of this page
/*
1. Welcome email, and give hostId
2. send form url on activating form
3. send info on when payment is due and how much it costs
*/

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  //   port: 465,
  secure: true, // use TLS
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  }
});

async function welcomeEmail(user, confLink) {

  const templateString = fs.readFileSync('./templates/welcome.hbs', 'utf-8');

  const template = handlebars.compile(templateString, {
    allowProtoPropertiesByDefault: true
  });

  const output = template(user, confLink);

  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: user.email,
    subject: 'Welcome to Commute!',
    html: output,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return false;
    } else {
      console.log('Email sent: ' + info.response);
      return true;
    }
  });

};

async function passwordResetLink(email, resetLink, user) {

  const templateString = fs.readFileSync('./templates/passwordReset.hbs', 'utf-8');

  const template = handlebars.compile(templateString, {
    allowProtoPropertiesByDefault: true
  });

  const output = template({ resetLink, user });

  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Password Reset Request',
    html: output,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function resetEmail(email, username) {

  const templateString = fs.readFileSync('./templates/resetSuccess.hbs', 'utf-8');

  const template = handlebars.compile(templateString, {
    allowProtoPropertiesByDefault: true
  });

  const output = template({ username });

  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Password Reset Success',
    html: output,
  };


  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(error);
    return false;
    ;
  }

}


async function sendConf(email, link) {

  const templateString = fs.readFileSync('./templates/resetSuccess.hbs', 'utf-8');

  const template = handlebars.compile(templateString, {
    allowProtoPropertiesByDefault: true
  });

  const output = template({ username });

  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Password Reset Success',
    html: output,
  };


  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(error);
    return false;
    ;
  }

}

module.exports = { welcomeEmail, passwordResetLink, resetEmail, sendConf };