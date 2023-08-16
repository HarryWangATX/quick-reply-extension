# Quick Reply Extension

Quick Reply is a Chrome extension that currently supports `lore.kernel.org`'s mirror list and allows for efficient replies right on the website!

We provide two high-level features:
- Selected text in threads are automatically quoted and copied into extension text box
- Header information (Tos, Ccs, Subject, In-Reply-To) all pre-filled


<!-- toc -->

- [Installation](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server#installation)
    - [Options](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server#options)
    - [Download](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server#download)
    - [SMTP Server Config](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server#smtp-server-config)
    - [Certificate Signing](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server#certificate-signing)
    - [Starting the Server](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server#starting-the-server)
- [Getting Started](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server#getting-started)
- [Releases and Contribution](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server#releases-and-contribution)
- [License](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server#releases-and-contribution)

<!-- tocstop -->


## Installation

### Options

There are two different versions of this extensions
- Google OAuth
- Node Server Bridge

This current branch is specifically built for users outside of Gmail. However, for Gmail users, I have provided a second option located in the [`main`](https://github.com/HarryWangATX/quick-reply-extension) branch. Included in that branch is Google OAuth authentication with Gmail API (easier to setup than this branch's server). The respective set-up guide is located in the [`README.md`](https://github.com/HarryWangATX/quick-reply-extension/#readme) in that branch. This `README.md` will contain the steps to setup the Node.JS bridge for HTTPS request to SMTP email server send.

### Download

Clone this repository through git: `git clone https://github.com/HarryWangATX/quick-reply-extension.git`. Checkout this branch, `git checkout node_server`.

After cloning go to `chrome://extensions` and click `Load Unpacked` to load the extension. For ease of use, please pin this extension. 

**NOTE: At this stage, the extension will not work!**

### SMTP Server Config

Create a file called `config.json`, and fill in the information as followed:

```json
{
  "smtp-host": "smtp.your-server.com",
  "port": [SMTP_PORT],
  "secure": [true_or_false],
  "name": "[YOUR_FULL_NAME]",
  "username": "[EMAIL_ADDRESS]",
  "app-password": "[APP_PASSWORD]"
}
```

### Certificate Signing

Now we will self-sign a SSL certificate for `localhost`. If you plan on deploying this server, make sure to use a publicly trusted CA.

First, make a folder called `cert` in `server` directory and `cd` into the folder, and then make another folder `CA` inside of the `cert` folder and `cd` into `CA`.

Now, we will generate a private key with passphrase: `openssl genrsa -out CA.key -des3 2048`.

Next, we can generate the CA certificate and set the expiration time to 10 years: `openssl req -x509 -sha256 -new -nodes -days 3650 -key CA.key -out CA.pem`. You can randomly fill in the information requested.

Inside of `CA` directory, create a directory called `localhost` and `cd` into it. Make a file called `localhost.ext` inside, which will store the information that needs to be written into the SSL Certificate. Include the following in this file. 

```ext
authorityKeyIdentifier = keyid,issuer
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
```
Make sure these domains match with the ones in `/etc/hosts`.

Now we will generate another key inside of the `localhost` directory to be used for a Certificate Signing Request: `openssl genrsa -out localhost.key -des3 2048`.

We can generate the CSR with `openssl req -new -key localhost.key -out localhost.csr`, the challenge passphrase can be anything.

To request for the CA to sign the certificate, we will use the  CA Certificate (`CA.pem` and `CA.key`) and the certificate extension file: `localhost.ext`. This will generate a `localhost.crt` valid for ten years.

To decrypt it for our node server, run `openssl rsa -in localhost.key -out localhost.decrypted.key`.

We will use these generated certificate and keys inside of the Node.JS Server.

At this state, Chrome will auto-block any requests sent because this is a self-signed certificate. To trust this certificate, go to `chrome://settings/certificates`. Click the `Authorities` tab.

![Chrome Certificate Authorities Page](https://i.imgur.com/fU8FgNI.png)

Click `import` and select the `CA.pem` file from `server/cert/CA/CA.pem` and check all the checkboxes.

When you go to `https://localhost:8443/` you should see a secured icon. If you changed the listening port, make sure to reflect those changes in the `background.js` file of the extension.

![Chrome Lock Icon](https://i.imgur.com/n2oSEuR.png)

Now, you are ready to start the server!

### Starting the Server

Assuming the same paths were followed during the certificate signing portion, the Node server is ready to go. Run `npm run start` or `node app.js` inside of the `server` directory to start the server. The server must be running in order for the Chrome extension to send the emails.

If the same paths were not followed in the previous section, please modify this portion of the code to the correct path.

```js
const options = {
  key: fs.readFileSync('./path/to/your/localhost.decrypted.key'),
  cert: fs.readFileSync('./path/to/your/localhost/localhost.crt')
};
```

Your app is now good to go!

## Getting Started

The main objective of this extension is to make replying to threads on `lore.kernel.org` with ease. To use this extension is quite simple. For a given message that you would like to respond to in a thread, please first click the `reply` button. This allows the extension to scrape the necessary header information. In the reply page, you will be able to highlight multiple bodies of text that you would like to respond to. *Clarification: you may highlight multiple times, the extension will cache all highlights.* Then, click the extension icon in the Chrome bar, and a popup should appear. Make the necessary replies in the text box provided. You can check to make sure email headers are correct with the `Show Details` button. If you want to re-select text, please click the `Clear Selected Quotes` button. If, at any point, the extension is unresponsive or content is incorrect, please refresh the page. If the error persists, please open up an issue in this repository. Once your email content is formulated, click the `Send Email with SMTP` button. The status of the email will be dynamically displayed on this button after send. To re-use this, simply select more text or move to a different message in a thread.

**Important: This extension will only work properly after going into the `reply` link of a message that you want to respond to!**

## Releases and Contribution

I will try to release new features as soon as possible upon request. Please do so by filling out a feature request in the issues tab!

I appreciate all contributions. If you are planning to contribute bug-fixes, please do so without any further discussion.

If you are planning to contribute new features, please first create an issue and discuss before opening a PR.

## License

This extension has an Apache License 2.0 License, which can be found in the [LICENSE](https://github.com/HarryWangATX/quick-reply-extension/blob/main/LICENSE) file.

