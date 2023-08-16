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



## Getting Started

The main objective of this extension is to make replying to threads on `lore.kernel.org` with ease. To use this extension is quite simple. For a given message that you would like to respond to in a thread, please first click the `reply` button. This allows the extension to scrape the necessary header information. In the reply page, you will be able to highlight multiple bodies of text that you would like to respond to. *Clarification: you may highlight multiple times, the extension will cache all highlights.* Then, click the extension icon in the Chrome bar, and a popup should appear. Make the necessary replies in the text box provided. You can check to make sure email headers are correct with the `Show Details` button. If you want to re-select text, please click the `Clear Selected Quotes` button. If, at any point, the extension is unresponsive or content is incorrect, please refresh the page. If the error persists, please open up an issue in this repository. Once your email content is formulated, click the `Send Email with Gmail` button. The status of the email will be dynamically displayed on this button after send. To re-use this, simply select more text or move to a different message in a thread.

**Important: This extension will only work properly after going into the `reply` link of a message that you want to respond to!**

## Releases and Contribution

I will try to release new features as soon as possible upon request. Please do so by filling out a feature request in the issues tab!

I appreciate all contributions. If you are planning to contribute bug-fixes, please do so without any further discussion.

If you are planning to contribute new features, please first create an issue and discuss before opening a PR.

## License

This extension has an Apache License 2.0 License, which can be found in the [LICENSE](https://github.com/HarryWangATX/quick-reply-extension/blob/main/LICENSE) file.

