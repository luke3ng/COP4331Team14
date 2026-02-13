
// Toggle Add Contact dropdown
const toggleButton = document.getElementById("toggleAddContact");
const addContactForm = document.getElementById("addContactForm");
let contactToDelete = null; 
const deleteModal = document.getElementById("deleteModal");
const deleteContactName = document.getElementById("deleteContactName");

toggleButton.addEventListener("click", () => {
  addContactForm.classList.toggle("hidden");
  toggleButton.classList.toggle("dropdown-open");
});


addContactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const userId = localStorage.getItem("userId") || 1; 

    //Add the contact
    await addContact(firstName, lastName, phone, email, userId);

    //Fetch list
    const updatedContacts = await getContacts(userId);

    //Render table
    renderContactsTable(updatedContacts);

    addContactForm.classList.add("hidden");
    toggleButton.classList.remove("dropdown-open");
    addContactForm.reset();
});

async function addContact(firstName, lastName, phone, email, userId) {
  try {
    const response = await fetch("LAMPAPI/AddContact.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        userId: userId
      })
    });

    const data = await response.json(); 

    if (data.error) {
      console.error("Add contact error:", data.error);
    } else {
      console.log("New contact ID:", data.contactId);
    }

  } catch (err) {
    console.error("Network error:", err);
  }
}

async function deleteContact(contactId, userId) {
  try {
    const response = await fetch("LAMPAPI/DeleteContact.php", { 
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contactId: contactId,
        userId: userId
      })
    });

    const data = await response.json();

    if (!data.success) {
      console.error("Delete contact error:", data.error);
    } else {
      console.log("Contact deleted successfully!");
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}

//The update function
async function updateContact(contactId, firstName, lastName, phone, email, userId) {
  try {
    const response = await fetch("LAMPAPI/UpdateContacts.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId: contactId,
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email
      })
    });
    const data = await response.json();
    if (!data.success) alert("Error: " + data.error);
    return data;
  } catch (err) {
    console.error("Update error:", err);
  }
}

async function getContacts(userId, search = "") {
  try {
    const response = await fetch("LAMPAPI/GetContacts.php", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: userId,
        search: search
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error fetching contacts:", data.error);
      return [];
    }

    return data.results;

  } catch (err) {
    console.error("Network error:", err);
    return [];
  }
}

function renderContactsTable(contacts) {
  const tableBody = document.getElementById("contactsTableBody");
  tableBody.innerHTML = "";

  if (contacts.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No contacts found</td></tr>';
    return;
  }

  contacts.forEach(contact => {
    const row = document.createElement("tr");

    //Name cell
    const nameCell = document.createElement("td");
    const nameText = document.createElement("span");
    nameText.textContent = `${contact.firstName} ${contact.lastName}`;
    const fNameInp = document.createElement("input");
    fNameInp.value = contact.firstName;
    fNameInp.classList.add("edit-input", "hidden");
    const lNameInp = document.createElement("input");
    lNameInp.value = contact.lastName;
    lNameInp.classList.add("edit-input", "hidden");
    nameCell.append(nameText, fNameInp, lNameInp);

    //Email cell
    const emailCell = document.createElement("td");
    const emailText = document.createElement("span");
    emailText.textContent = contact.email;
    const emailInp = document.createElement("input");
    emailInp.value = contact.email;
    emailInp.classList.add("edit-input", "hidden");
    emailCell.append(emailText, emailInp);

    //Phone cell
    const phoneCell = document.createElement("td");
    const phoneText = document.createElement("span");
    phoneText.textContent = contact.phone;
    const phoneInp = document.createElement("input");
    phoneInp.value = contact.phone;
    phoneInp.classList.add("edit-input", "hidden");
    phoneCell.append(phoneText, phoneInp);

    //Actions cell
    const actionsCell = document.createElement("td");
    actionsCell.className = "actions";
    const editBtn = document.createElement("button"); editBtn.textContent = "Edit";
    const deleteBtn = document.createElement("button"); deleteBtn.textContent = "Delete";
    const saveBtn = document.createElement("button"); saveBtn.textContent = "Save";
    saveBtn.classList.add("save-btn", "hidden");
    const cancelBtn = document.createElement("button"); cancelBtn.textContent = "Cancel";
    cancelBtn.classList.add("hidden");
    actionsCell.append(editBtn, deleteBtn, saveBtn, cancelBtn);

    //Toggle logic
    const toggle = (editing) => {
      [nameText, emailText, phoneText, editBtn, deleteBtn].forEach(el => el.classList.toggle("hidden", editing));
      [fNameInp, lNameInp, emailInp, phoneInp, saveBtn, cancelBtn].forEach(el => el.classList.toggle("hidden", !editing));
    };

    //Event listeners
    editBtn.onclick = () => toggle(true);
    cancelBtn.onclick = () => toggle(false);
    
    saveBtn.onclick = async () => {
  //Fallback for ID case sensitivity
  const cID = contact.id || contact.ID; 
  const res = await updateContact(cID, fNameInp.value, lNameInp.value, phoneInp.value, emailInp.value, userId);
  if (res && res.success) {
    renderContactsTable(await getContacts(userId)); 
  }
};

    deleteBtn.onclick = () => {
  contactToDelete = contact.id || contact.ID;
  deleteContactName.textContent = contact.firstName;

  deleteModal.classList.remove("hidden");
};

    row.append(nameCell, emailCell, phoneCell, actionsCell);
    tableBody.appendChild(row);
  });
} 

//Cancel button
document.getElementById("cancelDeleteBtn").onclick = () => {
  deleteModal.classList.add("hidden");
  contactToDelete = null;
};

//Confirm button
document.getElementById("confirmDeleteBtn").onclick = async () => {
  if (contactToDelete) {
    await deleteContact(contactToDelete, userId);
    
    //Refresh and Close
    renderContactsTable(await getContacts(userId));
    deleteModal.classList.add("hidden");
    contactToDelete = null;
  }
};

//Search Functionality
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", async () => {
    const searchTerm = searchInput.value.trim();

    //Fetch filtered contacts from the API
    const filteredContacts = await getContacts(userId, searchTerm);
    
    //Redraw the table with only the results
    renderContactsTable(filteredContacts);
});

//Allow enter key to trigger search too
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchButton.click();
    }
});

//This runs as soon as the script loads
(async () => {
    const initialContacts = await getContacts(userId);
    renderContactsTable(initialContacts);
})();





