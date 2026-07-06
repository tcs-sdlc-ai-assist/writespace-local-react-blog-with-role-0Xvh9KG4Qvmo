import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  login,
  register,
  logout,
  isAuthenticated,
  isAdmin,
  getCurrentUser,
} from './auth.js';
import {
  getUsers,
  addUser,
  getSession,
  saveSession,
  clearSession,
} from './storage.js';

describe('auth.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ─── login ─────────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns null when username is empty', () => {
      expect(login('', 'password')).toBeNull();
    });

    it('returns null when password is empty', () => {
      expect(login('admin', '')).toBeNull();
    });

    it('returns null when username is undefined', () => {
      expect(login(undefined, 'password')).toBeNull();
    });

    it('returns null when password is undefined', () => {
      expect(login('admin', undefined)).toBeNull();
    });

    it('returns null when both are empty', () => {
      expect(login('', '')).toBeNull();
    });

    it('logs in with hard-coded admin credentials', () => {
      const session = login('admin', 'admin123');
      expect(session).not.toBeNull();
      expect(session.username).toBe('admin');
      expect(session.role).toBe('admin');
      expect(session.displayName).toBe('Administrator');
      expect(session).toHaveProperty('userId');
    });

    it('saves session to localStorage on admin login', () => {
      login('admin', 'admin123');
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.username).toBe('admin');
      expect(session.role).toBe('admin');
    });

    it('creates admin user in localStorage if not present', () => {
      login('admin', 'admin123');
      const users = getUsers();
      const adminUser = users.find((u) => u.username === 'admin');
      expect(adminUser).toBeDefined();
      expect(adminUser.role).toBe('admin');
    });

    it('does not duplicate admin user on repeated logins', () => {
      login('admin', 'admin123');
      logout();
      login('admin', 'admin123');
      const users = getUsers();
      const adminUsers = users.filter((u) => u.username === 'admin');
      expect(adminUsers).toHaveLength(1);
    });

    it('returns null for wrong admin password', () => {
      expect(login('admin', 'wrongpassword')).toBeNull();
    });

    it('logs in with a localStorage user', () => {
      addUser({
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      const session = login('janedoe', 'password123');
      expect(session).not.toBeNull();
      expect(session.username).toBe('janedoe');
      expect(session.displayName).toBe('Jane Doe');
      expect(session.role).toBe('user');
      expect(session).toHaveProperty('userId');
    });

    it('saves session to localStorage on user login', () => {
      addUser({
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      login('janedoe', 'password123');
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.username).toBe('janedoe');
      expect(session.role).toBe('user');
    });

    it('returns null for wrong user password', () => {
      addUser({
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      expect(login('janedoe', 'wrongpassword')).toBeNull();
    });

    it('returns null for non-existent username', () => {
      expect(login('nonexistent', 'password123')).toBeNull();
    });

    it('trims the username before checking', () => {
      addUser({
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      const session = login('  janedoe  ', 'password123');
      expect(session).not.toBeNull();
      expect(session.username).toBe('janedoe');
    });

    it('trims admin username before checking', () => {
      const session = login('  admin  ', 'admin123');
      expect(session).not.toBeNull();
      expect(session.username).toBe('admin');
      expect(session.role).toBe('admin');
    });

    it('logs in an admin-role user from localStorage', () => {
      addUser({
        displayName: 'Other Admin',
        username: 'otheradmin',
        password: 'password123',
        role: 'admin',
      });
      const session = login('otheradmin', 'password123');
      expect(session).not.toBeNull();
      expect(session.role).toBe('admin');
    });
  });

  // ─── register ──────────────────────────────────────────────────────────

  describe('register', () => {
    it('registers a new user and returns a session', () => {
      const session = register('Jane Doe', 'janedoe', 'password123');
      expect(session).not.toBeNull();
      expect(session.username).toBe('janedoe');
      expect(session.displayName).toBe('Jane Doe');
      expect(session.role).toBe('user');
      expect(session).toHaveProperty('userId');
    });

    it('saves the new user to localStorage', () => {
      register('Jane Doe', 'janedoe', 'password123');
      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('janedoe');
      expect(users[0].displayName).toBe('Jane Doe');
      expect(users[0].role).toBe('user');
    });

    it('saves session to localStorage on register', () => {
      register('Jane Doe', 'janedoe', 'password123');
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.username).toBe('janedoe');
      expect(session.role).toBe('user');
    });

    it('throws when username already exists', () => {
      register('Jane Doe', 'janedoe', 'password123');
      clearSession();
      expect(() => register('Jane 2', 'janedoe', 'password456')).toThrow(
        'Username already exists'
      );
    });

    it('throws when displayName is empty', () => {
      expect(() => register('', 'janedoe', 'password123')).toThrow(
        'Display name is required'
      );
    });

    it('throws when username is empty', () => {
      expect(() => register('Jane', '', 'password123')).toThrow(
        'Username is required'
      );
    });

    it('throws when username is too short', () => {
      expect(() => register('Jane', 'ab', 'password123')).toThrow(
        'Username must be at least 3 characters'
      );
    });

    it('throws when password is too short', () => {
      expect(() => register('Jane', 'janedoe', '12345')).toThrow(
        'Password must be at least 6 characters'
      );
    });

    it('always registers with user role', () => {
      const session = register('Jane Doe', 'janedoe', 'password123');
      expect(session.role).toBe('user');
      const users = getUsers();
      expect(users[0].role).toBe('user');
    });
  });

  // ─── logout ────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('clears the session from localStorage', () => {
      login('admin', 'admin123');
      expect(getSession()).not.toBeNull();
      logout();
      expect(getSession()).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => logout()).not.toThrow();
    });
  });

  // ─── isAuthenticated ──────────────────────────────────────────────────

  describe('isAuthenticated', () => {
    it('returns false when no session exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when a session exists', () => {
      login('admin', 'admin123');
      expect(isAuthenticated()).toBe(true);
    });

    it('returns true after user login', () => {
      addUser({
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      login('janedoe', 'password123');
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false after logout', () => {
      login('admin', 'admin123');
      logout();
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true after register', () => {
      register('Jane Doe', 'janedoe', 'password123');
      expect(isAuthenticated()).toBe(true);
    });
  });

  // ─── isAdmin ──────────────────────────────────────────────────────────

  describe('isAdmin', () => {
    it('returns false when no session exists', () => {
      expect(isAdmin()).toBe(false);
    });

    it('returns true when logged in as admin', () => {
      login('admin', 'admin123');
      expect(isAdmin()).toBe(true);
    });

    it('returns false when logged in as regular user', () => {
      addUser({
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      login('janedoe', 'password123');
      expect(isAdmin()).toBe(false);
    });

    it('returns false after logout', () => {
      login('admin', 'admin123');
      logout();
      expect(isAdmin()).toBe(false);
    });

    it('returns false after registering a regular user', () => {
      register('Jane Doe', 'janedoe', 'password123');
      expect(isAdmin()).toBe(false);
    });

    it('returns true for a non-default admin user', () => {
      addUser({
        displayName: 'Other Admin',
        username: 'otheradmin',
        password: 'password123',
        role: 'admin',
      });
      login('otheradmin', 'password123');
      expect(isAdmin()).toBe(true);
    });
  });

  // ─── getCurrentUser ───────────────────────────────────────────────────

  describe('getCurrentUser', () => {
    it('returns null when no session exists', () => {
      expect(getCurrentUser()).toBeNull();
    });

    it('returns the session object when logged in as admin', () => {
      login('admin', 'admin123');
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.username).toBe('admin');
      expect(user.role).toBe('admin');
      expect(user.displayName).toBe('Administrator');
      expect(user).toHaveProperty('userId');
    });

    it('returns the session object when logged in as user', () => {
      addUser({
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      login('janedoe', 'password123');
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.username).toBe('janedoe');
      expect(user.displayName).toBe('Jane Doe');
      expect(user.role).toBe('user');
    });

    it('returns null after logout', () => {
      login('admin', 'admin123');
      logout();
      expect(getCurrentUser()).toBeNull();
    });

    it('returns the session object after register', () => {
      register('Jane Doe', 'janedoe', 'password123');
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.username).toBe('janedoe');
      expect(user.displayName).toBe('Jane Doe');
      expect(user.role).toBe('user');
    });
  });

  // ─── Integration: session persistence ─────────────────────────────────

  describe('integration', () => {
    it('session persists across multiple getCurrentUser calls', () => {
      login('admin', 'admin123');
      const user1 = getCurrentUser();
      const user2 = getCurrentUser();
      expect(user1).toEqual(user2);
    });

    it('login overwrites previous session', () => {
      addUser({
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      login('admin', 'admin123');
      expect(getCurrentUser().role).toBe('admin');
      login('janedoe', 'password123');
      expect(getCurrentUser().role).toBe('user');
      expect(getCurrentUser().username).toBe('janedoe');
    });

    it('register then logout then login works correctly', () => {
      register('Jane Doe', 'janedoe', 'password123');
      expect(isAuthenticated()).toBe(true);
      expect(isAdmin()).toBe(false);
      logout();
      expect(isAuthenticated()).toBe(false);
      const session = login('janedoe', 'password123');
      expect(session).not.toBeNull();
      expect(isAuthenticated()).toBe(true);
      expect(getCurrentUser().username).toBe('janedoe');
    });

    it('failed login does not create a session', () => {
      login('nonexistent', 'password123');
      expect(isAuthenticated()).toBe(false);
      expect(getCurrentUser()).toBeNull();
    });

    it('failed login does not overwrite existing session', () => {
      login('admin', 'admin123');
      expect(isAuthenticated()).toBe(true);
      const result = login('nonexistent', 'password123');
      expect(result).toBeNull();
      expect(isAuthenticated()).toBe(true);
      expect(getCurrentUser().username).toBe('admin');
    });

    it('admin login creates admin user in users list with correct fields', () => {
      login('admin', 'admin123');
      const users = getUsers();
      const adminUser = users.find((u) => u.username === 'admin');
      expect(adminUser).toBeDefined();
      expect(adminUser.displayName).toBe('Administrator');
      expect(adminUser.role).toBe('admin');
      expect(adminUser).toHaveProperty('id');
      expect(adminUser).toHaveProperty('createdAt');
    });

    it('session userId matches the user id in localStorage', () => {
      addUser({
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      login('janedoe', 'password123');
      const session = getCurrentUser();
      const users = getUsers();
      const user = users.find((u) => u.username === 'janedoe');
      expect(session.userId).toBe(user.id);
    });

    it('admin session userId matches admin user id in localStorage', () => {
      login('admin', 'admin123');
      const session = getCurrentUser();
      const users = getUsers();
      const adminUser = users.find((u) => u.username === 'admin');
      expect(session.userId).toBe(adminUser.id);
    });
  });
});