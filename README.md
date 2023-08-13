# Quick Reply Extension

Quick Reply is a Chrome extension that currently supports `lore.kernel.org`'s mirror list and allows for efficient replies right on the website!

We provide two high-level features:
- Selected text in threads are automatically quoted and copied into extension text box
- Header information (Tos, Ccs, Subject, In-Reply-To) all pre-filled


<!-- toc -->

- Installation
    - Download
    - Setting up Google OAuth & Gmail API
- Getting Started
- Releases and Contribution
- License

<!-- tocstop -->


## Installation

### Download

Clone this repository through git: `git clone`

After cloning go to `chrome://extensions` and click `Load Unpacked` to load the extension. For ease of use, please pin this extension. **NOTE: At this stage, the extension will not work!**

### Setting up Google OAuth & Gmail API

Go to [Google Cloud Platforms](https://console.cloud.google.com/), and create a new project, you can name it whatever you'd like.

In [APIs & Services](https://console.cloud.google.com/apis/dashboard), navigate to the `OAuth Consent Screen Page`. Create an OAuth consent screen, and follow its instructions for input fields. Make sure to add your own email to the internal testing user page. In the `Scopes` page, add the following scope:

- `https://www.googleapis.com/auth/gmail.send` → This grants permission to send emails on your behalf.

After adding the OAuth Consent Screen, head back over to the APIs dashboard and use the search bar at the top to find `GMail API` and enable it. Then, go to [Credentials](https://console.cloud.google.com/apis/credentials) and generate an API key. You may choose whether you want to restrict it or not. With the API_KEY, create a file in the root directory of the extension called `config.js` with the following information:

```js
const config = {
  API_KEY: "[YOUR_GOOGLE_API_KEY]",
};

export default config;
```
Now, in the credentials page, also generate an OAuth client ID. The `Application Type` is `Chrome Extension`, and you may name it however you would like. The `Item ID` is the `ID` in the image shown below:

![Email Extension Item ID](https://imgur.com/a/TIkpf0X)

After creating the OAuth client ID, copy the client ID given and substitute it in the `client_id` field in `manifest.json`:

```json
{
    "version": "1.0.0",
    "manifest_version": 3,
    "name": "Email Extension",
    "description": "Quick Email Reply Extension for lore.kernel.org mirror list.",
    "action": {
        "default_popup": "popup/popup.html",
        "default_title": "Email Extension"
    },
    "background": {
      "service_worker": "background.js",
      "type": "module"
    },
    "content_scripts": [
      {
        "matches": ["https://lore.kernel.org/*"],
        "js": ["scripts/content.js"],
        "run_at": "document_end"
      }
    ],
    "oauth2": {
      "client_id": "[YOUR_CLIENT_ID_HERE]",
      "scopes":["https://www.googleapis.com/auth/gmail.send"]
    },
    "permissions": [
      "identity",
      "activeTab",
      "tabs",
      "scripting"
    ],
    "host_permissions": [
      "*://lore.kernel.org/*"
    ]
}
```

Now you have completed the required setup for this extension. Head back to `chrome://extensions` and click the reload button shown to reload the extension. You can now freely use it!

## Getting Started

The main objective of this extension is to make replying to threads on `lore.kernel.org` with ease. To use this extension is quite simple. For a given message that you would like to respond to in a thread, please first click the `reply` button. This allows the extension to scrape the necessary header information. In the reply page, you will be able to highlight multiple bodies of text that you would like to respond to. *Clarification: you may highlight multiple times, the extension will cache all highlights.* Then, click the extension icon in the Chrome bar, and a popup should appear. Make the necessary replies in the text box provided. You can check to make sure email headers are correct with the `Show Details` button. If you want to re-select text, please click the `Clear Selected Quotes` button. If, at any point, the extension is unresponsive or content is incorrect, please refresh the page. If the error persists, please open up an issue in this repository. Once your email content is formulated, click the `Send Email with Gmail` button. The status of the email will be dynamically displayed on this button after send. To re-use this, simply select more text or move to a different message in a thread.

**Important: This extension will only work properly after going into the `reply` link of a message that you want to respond to!**

## Releases and Contribution

I will try to release new features as soon as possible upon request. Please do so by filling out a feature request in the issues tab!

I appreciate all contributions. If you are planning to contribute bug-fixes, please do so without any further discussion.

If you are planning to contribute new features, please first create an issue and discuss before opening a PR.

## License

This extension has an Apache License 2.0 License, which can be found in the [LICENSE](https://github.com/HarryWangATX/quick-reply-extension/blob/main/LICENSE) file.

