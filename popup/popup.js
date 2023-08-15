document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;

    // Check if the current URL matches the desired domain
    if (currentUrl.startsWith('https://lore.kernel.org/')) {
      // Show the popup content
      document.getElementById('popup').style.display = 'block';
    } else {
      // Hide the popup content
      document.getElementById('popup').style.display = 'none';
    }
  });

  const showRecipientsButton = document.getElementById('showRecipientsButton');
  const recipientsList = document.getElementById('recipientsList');
  const emailContentTextarea = document.getElementById('emailContent');
  const clearList = document.getElementById("clearText");

  
  chrome.runtime.sendMessage({ requestEmailInfo: true }, (response) => {
    let emailInfoFromContent = response.emailInfoFromContent;

    if (emailInfoFromContent.text && emailInfoFromContent.text.length > 0) {
      clearList.classList.remove('hidden');
    }
    
    let recipientsVisible = false;

    // Function to display or hide recipients based on the current state
    const toggleRecipients = () => {
      if (recipientsVisible) {
        recipientsList.classList.add('hidden');
        showRecipientsButton.textContent = 'Show Details';
      } else {
        recipientsList.innerHTML = `
          <h2>Details</h2>
          <p><strong>Subject:</strong> ${emailInfoFromContent.subject} </p>
          <p><strong>To:</strong> ${emailInfoFromContent.to.join(', ')}</p>
          <p><strong>CC:</strong> ${emailInfoFromContent.cc.join(', ')}</p>
          <p><strong>In-Reply-To:</strong> ${emailInfoFromContent.inReplyTo}</p>
        `;
        recipientsList.classList.remove('hidden');
        showRecipientsButton.textContent = 'Hide Details';
      }
      recipientsVisible = !recipientsVisible;
    };

    const textarea = document.getElementById('emailContent');
    console.log("textarea: ", textarea);
    if (textarea) {
      console.log("Text: ", emailInfoFromContent.text);
      textarea.value = emailInfoFromContent.text.join(''); 
    }

    clearList.addEventListener('click', () => {
      chrome.runtime.sendMessage( {clearSelected: true } );
      textarea.value = '';
      clearList.classList.add('hidden');
    });

    // Show/hide recipients when the button is clicked
    showRecipientsButton.addEventListener('click', toggleRecipients);

    // Send email button click handler
    const sendEmailButton = document.getElementById('sendEmailButton');

    // Handle Send Email Logic
    sendEmailButton.addEventListener('click', () => {
      const emailContent = emailContentTextarea.value;

      const message = { emailContent, emailInfoFromContent };

      sendEmailWithGmail(message);
    });

  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.success) {
      const sendEmailButton = document.getElementById('sendEmailButton');
      if (message.success == 'success') {
        sendEmailButton.innerText = 'Success!';
      }
      else {
        sendEmailButton.innerText = 'Error! Refresh to try again.';
      }
    }
  });
});

async function sendEmailWithGmail(message) {
  const sendEmailButton = document.getElementById('sendEmailButton');
  sendEmailButton.disabled = true;
  sendEmailButton.innerText = 'Sending...';
  await sendMessageToBackground(message);
}

function sendMessageToBackground(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
}
