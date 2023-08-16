const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const PORT = 8443; // Use the port of your choice

const options = {
  key: fs.readFileSync('./cert/CA/localhost/localhost.decrypted.key'),
  cert: fs.readFileSync('./cert/CA/localhost/localhost.crt')
};

const server = https.createServer(options, app);
const config = require('./config.json');
const nodemailer = require('nodemailer');

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.options('/send', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.send();
});

const transporter = nodemailer.createTransport({
  host: config['smtp-host'],
  port: config['port'],
  secure: config['secure'],
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: config['username'],
    pass: config['app-password']
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/send', (req, res) => {
  console.log("Request Received");

  var message = {
    from: `${config['name']} <${config['username']}>`,
    to: req.body.to,
    cc: req.body.cc,
    subject: req.body.subject,
    inReplyTo: req.body.inReplyTo,
    text: req.body.text
  }

  transporter.sendMail(message)
    .then(info => {
      console.log('Email sent:', info.response);
      res.status(200).json({ success: true });
    })
    .catch(error => {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false });
    });
})

server.listen(PORT, () => {
  console.log(`Email server listening on port ${PORT}`)
})
