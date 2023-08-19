# Quick Reply Extension

<p float="left">
    <img src="https://i.imgur.com/uCzwy3s.png" heigth="500" width="300">
    <img src="https://i.imgur.com/uOKVVUI.png" height="175" width="450">
</p>

Quick Reply is a Chrome extension that currently supports `lore.kernel.org`'s mirror list and allows for efficient replies right on the website!

We provide two high-level features:
- Selected text in threads are automatically quoted and copied into extension text box
- Header information (Tos, Ccs, Subject, In-Reply-To) all pre-filled


<!-- toc -->

- [Installation](https://github.com/HarryWangATX/quick-reply-extension/tree/main#installation)
    - [Options](https://github.com/HarryWangATX/quick-reply-extension/tree/main#options)
    - [Download](https://github.com/HarryWangATX/quick-reply-extension/tree/main#download)
- [Getting Started](https://github.com/HarryWangATX/quick-reply-extension/tree/main#getting-started)
- [Releases and Contribution](https://github.com/HarryWangATX/quick-reply-extension/tree/main#releases-and-contribution)
- [To Dos](https://github.com/HarryWangATX/quick-reply-extension/tree/main#to-dos)
- [License](https://github.com/HarryWangATX/quick-reply-extension/tree/main#releases-and-contribution)

<!-- tocstop -->


## Installation

### Options

There are two different versions of this extensions
- Google OAuth
- Node Server Bridge

This current branch is specifically built for Gmail users with Google OAuth. However, for other SMTP mail servers, I have provided a second option located in the [`node_server`](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server) branch. Included in that branch is a bridge that routes a HTTPS request from the chrome extension to the respective SMTP server. The respective set-up guide is located in the [`README.md`](https://github.com/HarryWangATX/quick-reply-extension/tree/node_server#readme) in that branch. This `README.md` will contain the steps to set-up the Google OAuth version of this extension.

### Download

This extension is now available on the Chrome Web Store! I am still undergoing verification for my OAuth consent screen, so it will be ready for use after that.

## Getting Started

The main objective of this extension is to make replying to threads on `lore.kernel.org` with ease. To use this extension is quite simple. For a given message that you would like to respond to in a thread, please first click the `reply` button. This allows the extension to scrape the necessary header information. In the reply page, you will be able to highlight multiple bodies of text that you would like to respond to. *Clarification: you may highlight multiple times, the extension will cache all highlights.* Then, click the extension icon in the Chrome bar, and a popup should appear. Make the necessary replies in the text box provided. You can check to make sure email headers are correct with the `Show Details` button. If you want to re-select text, please click the `Clear Selected Quotes` button. If, at any point, the extension is unresponsive or content is incorrect, please refresh the page. If the error persists, please open up an issue in this repository. Once your email content is formulated, click the `Send Email with Gmail` button. The status of the email will be dynamically displayed on this button after send. To re-use this, simply select more text or move to a different message in a thread.

**Important: This extension will only work properly after going into the `reply` link of a message that you want to respond to!**

## Releases and Contribution

I will try to release new features as soon as possible upon request. Please do so by filling out a feature request in the issues tab!

I appreciate all contributions. If you are planning to contribute bug-fixes, please do so without any further discussion.

If you are planning to contribute new features, please first create an issue and discuss before opening a PR.

## To Dos

- [x] Creating setup scripts to automate the installation process
- [ ] Looking into other OAuth Services
- [ ] Create an issue to request a feature

## License

This extension has an Apache License 2.0 License, which can be found in the [LICENSE](https://github.com/HarryWangATX/quick-reply-extension/blob/main/LICENSE) file.

