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
          <p><strong>To:</strong> ${emailInfoFromContent.to.join(', ') || ""}</p>
          <p><strong>CC:</strong> ${emailInfoFromContent.cc.join(', ') || ""}</p>
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
    const ackButton = document.getElementById('ack');
    const revButton = document.getElementById('rev');
    const clearButton = document.getElementById('clearSign');

    textarea.addEventListener('input', () => {
      const content = textarea.value;
      const regex = new RegExp('^Acked-by', 'm');
      const regex2 = new RegExp('^Reviewed-by', 'm');
      if (regex.test(content) || regex2.test(content)) {
        clearButton.classList.remove("hidden");
      }
      else {
        if (ackButton.innerText.includes('Ack') && revButton.innerText.includes('Rev')) {
          ackButton.disabled = false;
          revButton.disabled = false;
          clearButton.classList.add("hidden");
        }
      }
    });

    clearButton.addEventListener('click', () => {
      const regex = new RegExp('^Acked-by.+?$', 'gm');
      const regex2 = new RegExp('^Reviewed-by.+?$', 'gm');

      textarea.value = textarea.value.replace(regex, '');
      textarea.value = textarea.value.replace(regex2, '');
      

      clearButton.classList.add('hidden');
      ackButton.disabled = false;
      revButton.disabled = false;
    });


    // Handle Send Email Logic
    try {
      sendEmailButton.addEventListener('click', sendEmailButtonClicked);
    }
    catch(error) {
      console.log(error);
    }
    ackButton.addEventListener('click', async () => {
      event.preventDefault();

      const infoStored = await checkUserInfoStored();

      if (!infoStored) {
        ackButton.innerText = 'Please configure user info in Options page first!';
        ackButton.disabled = true;
        revButton.disabled = true;
        return;
      }

      const info = await loadUserInfo();
      const name = `${info.firstName} ${info.lastName} <${info.email}>`;

      textarea.value += '\nAcked-by: ' + name + '\n';

      ackButton.disabled = true;
      revButton.disabled = true;
      clearButton.classList.remove('hidden');
    });
    revButton.addEventListener('click', async () => {
      event.preventDefault();

      const infoStored = await checkUserInfoStored();

      if (!infoStored) {
        revButton.innerText = 'Please configure user info in Options page first!';
        revButton.disabled = true;
        ackButton.disabled = true;
        return;
      }

      const info = await loadUserInfo();
      const name = `${info.firstName} ${info.lastName} <${info.email}>`;

      textarea.value += '\nReviewed-by: ' + name + '\n';

      ackButton.disabled = true;
      revButton.disabled = true;
      clearButton.classList.remove('hidden');
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
    else if (message.clearStorage) {
      chrome.storage.local.remove('accessToken', () => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
        }
        console.log("cleared");
        sendEmailButtonClicked();
      });
    }
    return true;
  });
});

function sendEmailButtonClicked() {
  try {
    if (event)
      event.preventDefault();

    chrome.runtime.sendMessage({ requestEmailInfo: true }, async (response) => {
      let emailInfoFromContent = response.emailInfoFromContent;

      const infoStored = await checkUserInfoStored();

      if (!infoStored) {
        const sendEmailButton = document.getElementById('sendEmailButton');
        sendEmailButton.innerText = 'Please configure user info in Options page first!';
        sendEmailButton.disabled = true;
        return;
      }

      const stored = await checkAccessTokenStored();
      
      let accessToken = '';
      if (stored) {
        accessToken = await loadTokens();
      }
      else {
        try {
          accessToken = await getAccessToken();
          chrome.storage.local.set({accessToken: accessToken});
        }
        catch (error) {
          console.log(error);
          return;
        }
      }

      const info = await loadUserInfo();
      const name = `${info.firstName} ${info.lastName} <${info.email}>`;
      
      console.log(name);
      console.log(accessToken);
      
      const textarea = document.getElementById('emailContent');
      const emailContent = textarea.value;

      const message = { emailContent, emailInfoFromContent, accessToken, name };

      await sendEmailWithGmail(message);
    });
  }
  catch(error) {
    console.log(error);
  }
}

function checkUserInfoStored() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["firstName", "lastName", "email"], (result) => {
      console.log(result);
      console.log(!!result.firstName);
      console.log(!!result.lastName);
      console.log(!!result.email);
      resolve(result.firstName && result.lastName && result.email);
    });
  });
}

function loadUserInfo() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["firstName", "lastName", "email"], (result) => {
      resolve(result);
    });
  });
}

function checkAccessTokenStored() {
  return new Promise((resolve) => {
    chrome.storage.local.get('accessToken', (result) => {
      const accessToken = result.accessToken;
      const accessTokenExists = !!accessToken; // Convert to boolean
      console.log(accessTokenExists);
      resolve(accessTokenExists);
    });
  });
}

function loadTokens() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('accessToken', (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(result.accessToken);
      }
    });
  });
}

async function sendEmailWithGmail(message) {
  const sendEmailButton = document.getElementById('sendEmailButton');
  sendEmailButton.disabled = true;
  sendEmailButton.innerText = 'Sending...';
  await sendMessageToBackground(message);
  return true;
}

function sendMessageToBackground(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
}

function extractAccessTokenFromUrl(url) {
  const accessTokenParam = 'access_token=';
  const startIndex = url.indexOf(accessTokenParam);
  if (startIndex !== -1) {
    const endIndex = url.indexOf('&', startIndex);
    if (endIndex !== -1) {
      const accessToken = url.substring(startIndex + accessTokenParam.length, endIndex);
      return accessToken;
    } else {
      return url.substring(startIndex + accessTokenParam.length);
    }
  }
  return null;
}

// Function to get the user's access token using chrome.identity.getAuthToken
function getAccessToken() {
  let auth_url = 'https://accounts.google.com/o/oauth2/auth';
  let client_id = '170827741999-7m3e74go29qa2ph9efhq2ejdtj3q5n65.apps.googleusercontent.com';
  let redirect_url = chrome.identity.getRedirectURL("oauth2");
  let auth_params = {
    client_id: client_id,
    redirect_uri: redirect_url,
    response_type: 'token',
    scope: ['https://www.googleapis.com/auth/gmail.send']
  }

  console.log(redirect_url);

  const url = new URLSearchParams(auth_params).toString();
  auth_url += '?' + url;

  console.log(auth_url);

  return new Promise((resolve, reject) => {
    try {
      chrome.identity.launchWebAuthFlow({url: auth_url, interactive: true}, (responseUrl) => {
        console.log(responseUrl);

        const token = extractAccessTokenFromUrl(responseUrl);

        if (token) {
          resolve(token);
        }
        else {
          reject(new Error("Access token not found in the response"));
        }
      });
    }
    catch (error) {
      reject(error);
    }
  });
}
