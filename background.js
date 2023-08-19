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
function createEmailMessage(emailInfo, emailContent, name) {
  // Construct the email message using emailInfo and emailContent
  // Format the email message as required by the Gmail API
  // Return the raw email message string
 
  let emailBody = '';
  emailBody += 'From: ' + name + '\n';
  emailBody += 'To: ' + emailInfo.to.join(', ') + '\n';
  emailBody += 'Cc: ' + emailInfo.cc.join(', ') + '\n';
  emailBody += 'Subject: ' + emailInfo.subject + '\n';
  emailBody += 'In-Reply-To: <' + removeQuotesIfNeeded(emailInfo.inReplyTo) + '>\n';
  emailBody += 'References: <' + removeQuotesIfNeeded(emailInfo.inReplyTo) +'>\n\n';

  emailBody += emailContent;

  emailBody += '\n\n==============================\nReplied with love by Quick Reply Extension\nhttps://github.com/HarryWangATX/quick-reply-extension\n';

  console.log(emailBody);
  emailBody = btoa(emailBody);

  return emailBody;
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
  console.log(message);
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
    const accessToken = message.accessToken;
    const emailInfo = message.emailInfoFromContent; // Extracted email information
    const emailContent = message.emailContent; // Content of the email reply

    const emailRaw = createEmailMessage(emailInfo, emailContent, message.name);

    console.log(emailRaw);


    let send_fetch_url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/send` 
    let send_fetch_options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            'raw': emailRaw
        })
    }

    console.log("Gmail API: ", send_fetch_url);
    try {
      const response = await fetch(send_fetch_url, send_fetch_options);
      const data = await response.json();

      console.log('Email sent:', data);
      if (data.error) {
        if (data.error.status == "UNAUTHENTICATED") {
          console.log("unauthorized");
          chrome.runtime.sendMessage({ clearStorage: true });
        }
        else {
          chrome.runtime.sendMessage({ success: 'error' });
        }
      }
      else {
        chrome.runtime.sendMessage({ success: 'success' }); // Sending success response
      }
    } catch (error) {
      console.error('Error sending email:', error);
      chrome.runtime.sendMessage({ success: 'error' }); // Sending error response
    }

    console.log('Sending email:', emailInfo, emailContent);
  }

  return true;
});
