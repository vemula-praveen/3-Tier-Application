const API_URL = 'http://localhost:5001/api/users';
const userList = document.getElementById('user-list');
const statusBox = document.getElementById('status');
const form = document.getElementById('user-form');
const nameInput = document.getElementById('name');

async function loadUsers() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Unable to read users');
    }

    const users = await response.json();
    userList.innerHTML = '';

    if (!users.length) {
      const emptyItem = document.createElement('li');
      emptyItem.textContent = 'No users yet.';
      userList.appendChild(emptyItem);
      return;
    }

    users.forEach((user) => {
      const item = document.createElement('li');
      item.textContent = `${user.id}. ${user.name}`;
      userList.appendChild(item);
    });
  } catch (error) {
    statusBox.textContent = 'Could not connect to the backend API.';
    console.error(error);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();

  if (!name) {
    statusBox.textContent = 'Please enter a valid name.';
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to add user');
    }

    statusBox.textContent = `Added user: ${responseData.name}`;
    nameInput.value = '';
    await loadUsers();
  } catch (error) {
    statusBox.textContent = error.message;
    console.error(error);
  }
});

loadUsers();
