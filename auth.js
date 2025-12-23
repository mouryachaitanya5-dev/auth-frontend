const API_BASE = "http://localhost:8080/api/auth";

// ---------- Utilities ----------
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function getToken() {
  return localStorage.getItem("jwt");
}

function setToken(token) {
  localStorage.setItem("jwt", token);
}

function logout() {
  localStorage.removeItem("jwt");
  window.location.href = "login.html";
}

// ---------- Validation ----------
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

// ---------- Signup ----------
async function signup(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!name || !validateEmail(email) || !validatePassword(password)) {
    showToast("Invalid input (password ≥ 6 chars)", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) throw new Error("Signup failed");

    showToast("Signup successful. Please login.");
    setTimeout(() => window.location.href = "login.html", 1000);
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ---------- Login ----------
async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!validateEmail(email) || !validatePassword(password)) {
    showToast("Invalid credentials", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();
    setToken(data.token);

    showToast("Login successful");
    setTimeout(() => window.location.href = "dashboard.html", 1000);
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ---------- Protect Dashboard ----------
async function protectDashboard() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Unauthorized");

    const user = await res.json();
    document.getElementById("user").innerText = user.name;
  } catch {
    logout();
  }
}