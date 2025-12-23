import { apiFetch, protectRoute } from './auth.js';

const profileView = document.getElementById('profileView');
const profileForm = document.getElementById('profileForm');

const nameView = document.getElementById('nameView');
const emailView = document.getElementById('emailView');
const bioView = document.getElementById('bioView');
const avatarView = document.getElementById('avatarView');

const nameInput = document.getElementById('nameInput');
const bioInput = document.getElementById('bioInput');
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');

const editBtn = document.getElementById('editBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formMessage = document.getElementById('formMessage');

/* 🔐 Protect page */
protectRoute('/login.html');

/* 📥 Load profile */
async function loadProfile() {
  const res = await apiFetch('/api/users/me');
  const user = await res.json();

  nameView.textContent = user.name;
  emailView.textContent = user.email;
  bioView.textContent = user.bio || '—';
  avatarView.src = user.avatar_url || 'https://via.placeholder.com/80';

  nameInput.value = user.name;
  bioInput.value = user.bio || '';
  avatarInput.value = user.avatar_url || '';
  avatarPreview.src = user.avatar_url || 'https://via.placeholder.com/80';
}

/* ✏️ Toggle edit */
editBtn.addEventListener('click', () => {
  profileView.hidden = true;
  profileForm.hidden = false;
});

cancelBtn.addEventListener('click', () => {
  profileForm.hidden = true;
  profileView.hidden = false;
});

/* 🖼 Avatar preview */
avatarInput.addEventListener('input', () => {
  avatarPreview.src = avatarInput.value || 'https://via.placeholder.com/80';
});

/* 💾 Save profile */
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMessage.textContent = '';

  const payload = {
    name: nameInput.value.trim(),
    bio: bioInput.value.trim(),
    avatar_url: avatarInput.value.trim()
  };

  if (!payload.name) {
    formMessage.textContent = 'Name is required';
    formMessage.className = 'error';
    return;
  }

  const res = await apiFetch('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    formMessage.textContent = 'Profile updated successfully';
    formMessage.className = 'success';
    profileForm.hidden = true;
    profileView.hidden = false;
    loadProfile();
  } else {
    formMessage.textContent = 'Failed to update profile';
    formMessage.className = 'error';
  }
});

/* Init */
loadProfile();
