document.addEventListener("DOMContentLoaded", function () {
  const firstNameInput = document.getElementById("first-name");
  const lastNameInput = document.getElementById("last-name");
  const emailInput = document.getElementById("email");
  const saveButton = document.getElementById("save-button");

  // Load options from storage and populate the inputs
  chrome.storage.local.get(["firstName", "lastName", "email"], (result) => {
    firstNameInput.value = result.firstName || "";
    lastNameInput.value = result.lastName || "";
    emailInput.value = result.email || "";
  });

  // Save options to storage when the Save button is clicked
  saveButton.addEventListener("click", function (event) {
    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const email = emailInput.value;

    // Store the options in local storage
    chrome.storage.local.set({ firstName: firstName, lastName: lastName, email: email }, function () {
      console.log("Options saved:", { firstName, lastName, email });
    });
  });


});
