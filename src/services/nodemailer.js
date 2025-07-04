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

async function welcomeEmail(user) {

  const templateString = fs.readFileSync('./templates/welcome.hbs', 'utf-8');

  const template = handlebars.compile(templateString);
  const output = template(user);
  console.log(output);

  let mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: emails,
    subject: 'Welcome to Commute!',
    text: output,
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

module.exports = welcomeEmail;