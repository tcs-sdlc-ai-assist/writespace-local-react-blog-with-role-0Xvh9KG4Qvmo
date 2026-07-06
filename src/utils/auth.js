import {
  getUsers,
  addUser,
  getSession,
  saveSession,
  clearSession,
} from './storage.js';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

/**
 * Attempt to log in with the given credentials.
 * Checks hard-coded admin credentials first, then localStorage users.
 * @param {string} username - The username to authenticate
 * @param {string} password - The password to verify
 * @returns {Object|null} Session object on success, or null on failure
 */
export function login(username, password) {
  if (!username || !password) {
    return null;
  }

  const trimmedUsername = username.trim();

  // Check hard-coded admin credentials first
  if (trimmedUsername === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Ensure admin user exists in localStorage users list
    const users = getUsers();
    let adminUser = users.find((u) => u.username === ADMIN_USERNAME && u.role === 'admin');

    if (!adminUser) {
      // Create the admin user in localStorage if not present
      try {
        adminUser = addUser({
          displayName: 'Administrator',
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
          role: 'admin',
        });
      } catch {
        // If admin already exists (race condition), find it
        adminUser = getUsers().find((u) => u.username === ADMIN_USERNAME);
      }
    }

    const session = {
      userId: adminUser.id,
      username: adminUser.username,
      displayName: adminUser.displayName,
      role: 'admin',
    };
    saveSession(session);
    return session;
  }

  // Check localStorage users
  const users = getUsers();
  const user = users.find(
    (u) => u.username === trimmedUsername && u.password === password
  );

  if (!user) {
    return null;
  }

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
  saveSession(session);
  return session;
}

/**
 * Register a new user with the 'user' role and log them in.
 * @param {string} displayName - The display name for the new user
 * @param {string} username - The desired username
 * @param {string} password - The desired password
 * @returns {Object} Session object on success
 * @throws {Error} If validation fails or username already exists
 */
export function register(displayName, username, password) {
  const newUser = addUser({
    displayName,
    username,
    password,
    role: 'user',
  });

  const session = {
    userId: newUser.id,
    username: newUser.username,
    displayName: newUser.displayName,
    role: newUser.role,
  };
  saveSession(session);
  return session;
}

/**
 * Log out the current user by clearing the session.
 */
export function logout() {
  clearSession();
}

/**
 * Check if a user is currently authenticated.
 * @returns {boolean} True if a session exists
 */
export function isAuthenticated() {
  const session = getSession();
  return session !== null;
}

/**
 * Check if the current user has the admin role.
 * @returns {boolean} True if the current session user is an admin
 */
export function isAdmin() {
  const session = getSession();
  return session !== null && session.role === 'admin';
}

/**
 * Get the current user's session object.
 * @returns {Object|null} The session object or null if not logged in
 */
export function getCurrentUser() {
  return getSession();
}