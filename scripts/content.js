// alert("Content Running!");

function extractEmailRecipients(text) {
  const emailInfo = {
    to: [],
    cc: [],
    inReplyTo: '',
    text: ''
  };

  const toPattern = /--to=(.*?)\s/g;
  const ccPattern = /--cc=(.*?)\s/g;
  const inReplyToPattern = /--in-reply-to=(.*?)\s/g;

  const toMatches = text.match(toPattern);
  const ccMatches = text.match(ccPattern);
  const inReplyToMatches = text.match(inReplyToPattern);

  if (toMatches) {
    emailInfo.to = toMatches.map(match => match.replace('--to=', '').trim());
  }

  if (ccMatches) {
    emailInfo.cc = ccMatches.map(match => match.replace('--cc=', '').trim());
  }

  if (inReplyToMatches && inReplyToMatches.length > 0) {
    emailInfo.inReplyTo = inReplyToMatches[0].replace('--in-reply-to=', '').trim();
  }

  return emailInfo;
}

document.addEventListener('mouseup', (event) => {
  try {
    if (window.getSelection) {

      const selectedText = window.getSelection().toString().trim();
      
      if (selectedText) {
        // Send the selected text to the background script
        chrome.runtime.sendMessage({ action: 'selectedText', text: selectedText });
      }
    }
  }
  catch (error) {
    console.log(error);
  }
});


function getEmailInformation() {
  // Get the text content of the webpage
  const emailInstructionsText = document.body.innerText;
  let subject = '';

  console.log("Body text: ", emailInstructionsText);

  try {
    subject = document.getElementById('t').textContent
  }
  catch(error) {
    console.log(error);
  }
  // Parse the email instructions and extract the information
  const emailInfo = extractEmailRecipients(emailInstructionsText);

  emailInfo.subject = subject;

  chrome.runtime.sendMessage({ emailInfo });
};

// Send the extracted information to the background script
getEmailInformation();
