// Listen for messages from the popup
let emailInfoFromContent = {};
let last_quoted = new Set();

function quoteLine(toQuote) {
  const lines = toQuote.split('\n');
  let result = '';
  
  for (let i = 0; i < lines.length; i++) {
    result += '> ' + lines[i] + '\n';
  }

  result += '\n\n';

  return result;
}


function removeQuotesIfNeeded(inputString) {
  const trimmedString = inputString.trim();
  
  if (trimmedString.startsWith("'") && trimmedString.endsWith("'")) {
    return trimmedString.substring(1, trimmedString.length - 1);
  } else if (trimmedString.startsWith("\"") && trimmedString.endsWith("\"")) {
    return trimmedString.substring(1, trimmedString.length - 1);
  }
  
  return inputString;
}

// Function to create the email message
function createEmailMessage(emailInfo, emailContent) {
  // Construct the email message using emailInfo and emailContent
  // Format the email message as required by the Gmail API
  // Return the raw email message string
 
  let emailRet = {
    to: emailInfo.to.join(', '),
    cc: emailInfo.cc.join(', '),
    subject: emailInfo.subject,
    inReplyTo: `<${removeQuotesIfNeeded(emailInfo.inReplyTo)}>`,
    text: emailContent += '\n\n====================================================\nReplied with love by Quick Reply Extension <https://github.com/HarryWangATX/quick-reply-extension> :)\n'
  }

  return emailRet;
}

chrome.tabs.onActivated.addListener(function(info) {
  console.log("Tab Changed.");
  chrome.tabs.get(info.tabId, function(tab) {
    if (tab.url && tab.url.startsWith('https://lore.kernel.org')) {
      try {
        last_quoted = new Set();
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          files: ['scripts/content.js']
        });
      }
      catch (error) {
        console.log(error);
      }
    }
  });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.emailInfo) {
    emailInfoFromContent = message.emailInfo;
    console.log(emailInfoFromContent);
  }
  else if (message.requestEmailInfo) {
    emailInfoFromContent.text = Array.from(last_quoted);
    console.log(emailInfoFromContent);
    sendResponse( { emailInfoFromContent } )
  }
  else if (message.action == 'selectedText') {
    last_quoted.add(quoteLine(message.text));
    console.log(last_quoted);
    emailInfoFromContent.text = last_quoted;
  }
  else if (message.clearSelected) {
    last_quoted = new Set();
  }

  if (message.emailContent) {
    const emailInfo = message.emailInfoFromContent; // Extracted email information
    const emailContent = message.emailContent; // Content of the email reply

    const emailRaw = createEmailMessage(emailInfo, emailContent);

    console.log(emailRaw);

    /*
    var message = {
      from: `${config['name']} <${config['username']}>`,
      to: req.body.to,
      cc: req.body.cc,
      subject: req.body.subject,
      inReplyTo: req.body.inReplyTo,
      text: req.body.text
    }
    */ 
    let send_fetch_url = 'https://localhost:8443/send';
    let send_fetch_options = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailRaw)
    }

    try {
      const response = await fetch(send_fetch_url, send_fetch_options);
      const data = await response.json();

      if (data.success) {

        console.log('Email sent:', data);
        chrome.runtime.sendMessage({ success: 'success' }); // Sending success response
      }
      else {

        console.log('Error sending email:', data);
        chrome.runtime.sendMessage({ success: 'error' }); // Sending success response
      }
    } catch (error) {
      console.error('Error sending email:', error);
      chrome.runtime.sendMessage({ success: 'error' }); // Sending error response
    }

    // Perform your email sending logic here
    // Use "emailInfo" and "emailContent" to send the email
    console.log('Sending email:', emailInfo, emailContent);
  }
});
