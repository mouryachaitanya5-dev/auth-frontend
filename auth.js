// auth.js — ES module (save this as a plain file auth.js, do NOT include <script> tags here)

// Configure API base and token storage mode:
// API_BASE = '' means same origin; set to 'http://localhost:8080' if your backend runs there.
export const API_BASE = '';
// STORAGE_MODE: 'cookie' (recommended, production) or 'localStorage' (dev)
export const STORAGE_MODE = 'cookie';

const LS_KEY = 'auth_token';

// Get token (only used in localStorage mode)
export function getToken() {
  if (STORAGE_MODE === 'localStorage') {
    return localStorage.getItem(LS_KEY);
  }
  return null;
}

export function saveToken(token) {
  if (STORAGE_MODE === 'localStorage') {
    localStorage.setItem(LS_KEY, token);
  }
}

export function clearToken() {
  if (STORAGE_MODE === 'localStorage') {
    localStorage.removeItem(LS_KEY);
  }
}

// Generic fetch wrapper: attaches Authorization when using localStorage,
// uses credentials:'include' when using cookie mode.
export async function apiFetch(path, options = {}) {
  const url = API_BASE + path;
  const opts = { ...options };

  if (!opts.headers) opts.headers = {};

  // If body is not FormData and content-type not set, set JSON header
  const bodyIsForm = opts.body instanceof FormData;
  if (!bodyIsForm && opts.body !== undefined && !opts.headers['Content-Type']) {
    opts.headers['Content-Type'] = 'application/json';
  }

  if (STORAGE_MODE === 'localStorage') {
    const token = getToken();
    if (token) {
      opts.headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    // cookie mode: include credentials
    opts.credentials = opts.credentials || 'include';
  }

  const res = await fetch(url, opts);

  // Automatic clear on 401 for localStorage mode
  if (res.status === 401 && STORAGE_MODE === 'localStorage') {
    clearToken();
  }
  return res;
}

// Convenience wrappers for auth endpoints
export async function signup({ name, email, password }) {
  return apiFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}

export async function login({ email, password }) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (res.ok && STORAGE_MODE === 'localStorage') {
    // expect backend to return { token }
    try {
      const json = await res.json();
      if (json?.token) {
        saveToken(json.token);
      }
    } catch (e) {
      // if server set cookie mode, there may be no JSON body
    }
  }
  return res;
}

export async function me() {
  const res = await apiFetch('/api/auth/me', { method: 'GET' });
  if (!res.ok) {
    // throw response to let caller handle redirects/errors
    const err = new Error('Unauthorized');
    err.response = res;
    throw err;
  }
  return res.json();
}

// Helper to protect route: call on page load to verify user and redirect if not
export async function protectRoute(redirectTo = '/login.html') {
  try {
    await me();
    return true;
  } catch (err) {
    window.location.href = redirectTo;
    return false;
  }
}
