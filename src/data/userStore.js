// src/data/userStore.js
// Simple localStorage-based user registry for the CarCare prototype.
// Stores registered users and per-user app state.
// NOTE: Passwords are stored as a basic hash — this is a demo, not production crypto.

const USERS_KEY = 'carcare_users';
const SESSION_KEY = 'carcare_session';

// ----- Simple hash (demo only) -----
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash).toString(36);
}

// ----- User registry -----

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function emailExists(email) {
  return getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
}

export function registerUser({ name, email, phone, password, city = '', pincode = '' }) {
  const users = getUsers();
  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const user = {
    id,
    name,
    email: email.toLowerCase(),
    phone,
    city,
    pincode,
    initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    passwordHash: simpleHash(password),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function findUser(email, password) {
  const users = getUsers();
  const hash = simpleHash(password);
  return users.find(
    u => u.email === email.toLowerCase() && u.passwordHash === hash
  ) || null;
}

// ----- Session -----

export function saveSession(userId) {
  localStorage.setItem(SESSION_KEY, userId);
}

export function getSession() {
  return localStorage.getItem(SESSION_KEY) || null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ----- Per-user state -----

function stateKey(userId) {
  return `carcare_state_${userId}`;
}

export function getUserState(userId) {
  try {
    const raw = localStorage.getItem(stateKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveUserState(userId, state) {
  try {
    localStorage.setItem(stateKey(userId), JSON.stringify(state));
  } catch { /* ignore */ }
}

export function clearUserState(userId) {
  localStorage.removeItem(stateKey(userId));
}
