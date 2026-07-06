import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getPosts,
  savePosts,
  addPost,
  updatePost,
  deletePost,
  getUsers,
  saveUsers,
  addUser,
  deleteUser,
  getSession,
  saveSession,
  clearSession,
} from './storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ─── getPosts ────────────────────────────────────────────────────────────

  describe('getPosts', () => {
    it('returns an empty array when no posts exist', () => {
      expect(getPosts()).toEqual([]);
    });

    it('returns parsed posts from localStorage', () => {
      const posts = [
        {
          id: '1',
          title: 'Test',
          content: 'Content',
          authorId: 'u1',
          authorName: 'User',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      expect(getPosts()).toEqual(posts);
    });

    it('returns an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_posts', '{invalid json');
      expect(getPosts()).toEqual([]);
    });

    it('returns an empty array when localStorage.getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      expect(getPosts()).toEqual([]);
    });
  });

  // ─── savePosts ───────────────────────────────────────────────────────────

  describe('savePosts', () => {
    it('saves posts to localStorage', () => {
      const posts = [
        {
          id: '1',
          title: 'Test',
          content: 'Content',
          authorId: 'u1',
          authorName: 'User',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      savePosts(posts);
      expect(JSON.parse(localStorage.getItem('writespace_posts'))).toEqual(posts);
    });

    it('does not throw when localStorage.setItem fails', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => savePosts([])).not.toThrow();
      consoleSpy.mockRestore();
    });
  });

  // ─── addPost ─────────────────────────────────────────────────────────────

  describe('addPost', () => {
    it('adds a new post and returns it with id and createdAt', () => {
      const post = {
        title: 'My Post',
        content: 'Some content here',
        authorId: 'u1',
        authorName: 'Author',
      };
      const result = addPost(post);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
      expect(result.title).toBe('My Post');
      expect(result.content).toBe('Some content here');
      expect(result.authorId).toBe('u1');
      expect(result.authorName).toBe('Author');

      const stored = getPosts();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(result.id);
    });

    it('trims title and content', () => {
      const result = addPost({
        title: '  Trimmed Title  ',
        content: '  Trimmed Content  ',
        authorId: 'u1',
        authorName: 'Author',
      });
      expect(result.title).toBe('Trimmed Title');
      expect(result.content).toBe('Trimmed Content');
    });

    it('throws when title is missing', () => {
      expect(() =>
        addPost({ title: '', content: 'Content', authorId: 'u1', authorName: 'A' })
      ).toThrow('Title is required');
    });

    it('throws when title is only whitespace', () => {
      expect(() =>
        addPost({ title: '   ', content: 'Content', authorId: 'u1', authorName: 'A' })
      ).toThrow('Title is required');
    });

    it('throws when content is missing', () => {
      expect(() =>
        addPost({ title: 'Title', content: '', authorId: 'u1', authorName: 'A' })
      ).toThrow('Content is required');
    });

    it('throws when content is only whitespace', () => {
      expect(() =>
        addPost({ title: 'Title', content: '   ', authorId: 'u1', authorName: 'A' })
      ).toThrow('Content is required');
    });

    it('throws when title exceeds 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      expect(() =>
        addPost({ title: longTitle, content: 'Content', authorId: 'u1', authorName: 'A' })
      ).toThrow('Title must be 100 characters or less');
    });

    it('throws when content exceeds 5000 characters', () => {
      const longContent = 'a'.repeat(5001);
      expect(() =>
        addPost({ title: 'Title', content: longContent, authorId: 'u1', authorName: 'A' })
      ).toThrow('Content must be 5000 characters or less');
    });

    it('allows title of exactly 100 characters', () => {
      const title = 'a'.repeat(100);
      const result = addPost({
        title,
        content: 'Content',
        authorId: 'u1',
        authorName: 'A',
      });
      expect(result.title).toBe(title);
    });

    it('allows content of exactly 5000 characters', () => {
      const content = 'a'.repeat(5000);
      const result = addPost({
        title: 'Title',
        content,
        authorId: 'u1',
        authorName: 'A',
      });
      expect(result.content).toBe(content);
    });
  });

  // ─── updatePost ──────────────────────────────────────────────────────────

  describe('updatePost', () => {
    let existingPost;

    beforeEach(() => {
      existingPost = addPost({
        title: 'Original Title',
        content: 'Original Content',
        authorId: 'u1',
        authorName: 'Author',
      });
    });

    it('updates the title of an existing post', () => {
      const updated = updatePost(existingPost.id, { title: 'New Title' });
      expect(updated.title).toBe('New Title');
      expect(updated.content).toBe('Original Content');

      const stored = getPosts();
      expect(stored[0].title).toBe('New Title');
    });

    it('updates the content of an existing post', () => {
      const updated = updatePost(existingPost.id, { content: 'New Content' });
      expect(updated.content).toBe('New Content');
      expect(updated.title).toBe('Original Title');
    });

    it('updates both title and content', () => {
      const updated = updatePost(existingPost.id, {
        title: 'New Title',
        content: 'New Content',
      });
      expect(updated.title).toBe('New Title');
      expect(updated.content).toBe('New Content');
    });

    it('trims updated title and content', () => {
      const updated = updatePost(existingPost.id, {
        title: '  Trimmed  ',
        content: '  Trimmed Content  ',
      });
      expect(updated.title).toBe('Trimmed');
      expect(updated.content).toBe('Trimmed Content');
    });

    it('throws when post is not found', () => {
      expect(() => updatePost('nonexistent', { title: 'X' })).toThrow('Post not found');
    });

    it('throws when updated title is empty', () => {
      expect(() => updatePost(existingPost.id, { title: '' })).toThrow('Title is required');
    });

    it('throws when updated title is only whitespace', () => {
      expect(() => updatePost(existingPost.id, { title: '   ' })).toThrow('Title is required');
    });

    it('throws when updated content is empty', () => {
      expect(() => updatePost(existingPost.id, { content: '' })).toThrow('Content is required');
    });

    it('throws when updated content is only whitespace', () => {
      expect(() => updatePost(existingPost.id, { content: '   ' })).toThrow('Content is required');
    });

    it('throws when updated title exceeds 100 characters', () => {
      expect(() =>
        updatePost(existingPost.id, { title: 'a'.repeat(101) })
      ).toThrow('Title must be 100 characters or less');
    });

    it('throws when updated content exceeds 5000 characters', () => {
      expect(() =>
        updatePost(existingPost.id, { content: 'a'.repeat(5001) })
      ).toThrow('Content must be 5000 characters or less');
    });
  });

  // ─── deletePost ──────────────────────────────────────────────────────────

  describe('deletePost', () => {
    it('deletes an existing post', () => {
      const post = addPost({
        title: 'To Delete',
        content: 'Content',
        authorId: 'u1',
        authorName: 'Author',
      });
      expect(getPosts()).toHaveLength(1);
      deletePost(post.id);
      expect(getPosts()).toHaveLength(0);
    });

    it('throws when post is not found', () => {
      expect(() => deletePost('nonexistent')).toThrow('Post not found');
    });

    it('only deletes the specified post', () => {
      const post1 = addPost({
        title: 'Post 1',
        content: 'Content 1',
        authorId: 'u1',
        authorName: 'Author',
      });
      const post2 = addPost({
        title: 'Post 2',
        content: 'Content 2',
        authorId: 'u1',
        authorName: 'Author',
      });
      deletePost(post1.id);
      const remaining = getPosts();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(post2.id);
    });
  });

  // ─── getUsers ────────────────────────────────────────────────────────────

  describe('getUsers', () => {
    it('returns an empty array when no users exist', () => {
      expect(getUsers()).toEqual([]);
    });

    it('returns parsed users from localStorage', () => {
      const users = [
        {
          id: 'u1',
          displayName: 'Test User',
          username: 'testuser',
          password: 'password123',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(users));
      expect(getUsers()).toEqual(users);
    });

    it('returns an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_users', 'not valid json');
      expect(getUsers()).toEqual([]);
    });

    it('returns an empty array when localStorage.getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      expect(getUsers()).toEqual([]);
    });
  });

  // ─── saveUsers ───────────────────────────────────────────────────────────

  describe('saveUsers', () => {
    it('saves users to localStorage', () => {
      const users = [
        {
          id: 'u1',
          displayName: 'Test',
          username: 'test',
          password: 'pass123456',
          role: 'user',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      saveUsers(users);
      expect(JSON.parse(localStorage.getItem('writespace_users'))).toEqual(users);
    });

    it('does not throw when localStorage.setItem fails', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => saveUsers([])).not.toThrow();
      consoleSpy.mockRestore();
    });
  });

  // ─── addUser ─────────────────────────────────────────────────────────────

  describe('addUser', () => {
    it('adds a new user and returns it with id and createdAt', () => {
      const result = addUser({
        displayName: 'Jane Doe',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('createdAt');
      expect(result.displayName).toBe('Jane Doe');
      expect(result.username).toBe('janedoe');
      expect(result.password).toBe('password123');
      expect(result.role).toBe('user');

      const stored = getUsers();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(result.id);
    });

    it('trims displayName and username', () => {
      const result = addUser({
        displayName: '  Jane  ',
        username: '  janedoe  ',
        password: 'password123',
        role: 'user',
      });
      expect(result.displayName).toBe('Jane');
      expect(result.username).toBe('janedoe');
    });

    it('defaults role to user when not specified', () => {
      const result = addUser({
        displayName: 'Jane',
        username: 'janedoe',
        password: 'password123',
      });
      expect(result.role).toBe('user');
    });

    it('throws when displayName is missing', () => {
      expect(() =>
        addUser({ displayName: '', username: 'jane', password: 'password123' })
      ).toThrow('Display name is required');
    });

    it('throws when displayName is only whitespace', () => {
      expect(() =>
        addUser({ displayName: '   ', username: 'jane', password: 'password123' })
      ).toThrow('Display name is required');
    });

    it('throws when username is missing', () => {
      expect(() =>
        addUser({ displayName: 'Jane', username: '', password: 'password123' })
      ).toThrow('Username is required');
    });

    it('throws when username is only whitespace', () => {
      expect(() =>
        addUser({ displayName: 'Jane', username: '   ', password: 'password123' })
      ).toThrow('Username is required');
    });

    it('throws when username is less than 3 characters', () => {
      expect(() =>
        addUser({ displayName: 'Jane', username: 'ab', password: 'password123' })
      ).toThrow('Username must be at least 3 characters');
    });

    it('throws when password is missing', () => {
      expect(() =>
        addUser({ displayName: 'Jane', username: 'janedoe', password: '' })
      ).toThrow('Password must be at least 6 characters');
    });

    it('throws when password is less than 6 characters', () => {
      expect(() =>
        addUser({ displayName: 'Jane', username: 'janedoe', password: '12345' })
      ).toThrow('Password must be at least 6 characters');
    });

    it('throws when username already exists', () => {
      addUser({
        displayName: 'Jane',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      expect(() =>
        addUser({
          displayName: 'Jane 2',
          username: 'janedoe',
          password: 'password456',
          role: 'user',
        })
      ).toThrow('Username already exists');
    });

    it('allows username of exactly 3 characters', () => {
      const result = addUser({
        displayName: 'Jane',
        username: 'jan',
        password: 'password123',
        role: 'user',
      });
      expect(result.username).toBe('jan');
    });

    it('allows password of exactly 6 characters', () => {
      const result = addUser({
        displayName: 'Jane',
        username: 'janedoe',
        password: '123456',
        role: 'user',
      });
      expect(result.password).toBe('123456');
    });

    it('can create an admin user', () => {
      const result = addUser({
        displayName: 'Admin',
        username: 'adminuser',
        password: 'password123',
        role: 'admin',
      });
      expect(result.role).toBe('admin');
    });
  });

  // ─── deleteUser ──────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('deletes an existing user', () => {
      const user = addUser({
        displayName: 'Jane',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      expect(getUsers()).toHaveLength(1);
      deleteUser(user.id);
      expect(getUsers()).toHaveLength(0);
    });

    it('throws when user is not found', () => {
      expect(() => deleteUser('nonexistent')).toThrow('User not found');
    });

    it('throws when trying to delete the default admin account', () => {
      const admin = addUser({
        displayName: 'Administrator',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
      });
      expect(() => deleteUser(admin.id)).toThrow('Cannot delete the default admin account');
    });

    it('throws when trying to delete the current session user', () => {
      const user = addUser({
        displayName: 'Jane',
        username: 'janedoe',
        password: 'password123',
        role: 'user',
      });
      saveSession({
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      });
      expect(() => deleteUser(user.id)).toThrow('Cannot delete your own account');
    });

    it('only deletes the specified user', () => {
      const user1 = addUser({
        displayName: 'User 1',
        username: 'user1',
        password: 'password123',
        role: 'user',
      });
      const user2 = addUser({
        displayName: 'User 2',
        username: 'user2',
        password: 'password123',
        role: 'user',
      });
      deleteUser(user1.id);
      const remaining = getUsers();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(user2.id);
    });

    it('allows deleting a non-default admin user', () => {
      const adminUser = addUser({
        displayName: 'Other Admin',
        username: 'otheradmin',
        password: 'password123',
        role: 'admin',
      });
      expect(() => deleteUser(adminUser.id)).not.toThrow();
      expect(getUsers()).toHaveLength(0);
    });
  });

  // ─── getSession ──────────────────────────────────────────────────────────

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      expect(getSession()).toBeNull();
    });

    it('returns parsed session from localStorage', () => {
      const session = {
        userId: 'u1',
        username: 'janedoe',
        displayName: 'Jane Doe',
        role: 'user',
      };
      localStorage.setItem('writespace_session', JSON.stringify(session));
      expect(getSession()).toEqual(session);
    });

    it('returns null when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_session', 'not json');
      expect(getSession()).toBeNull();
    });

    it('returns null when localStorage.getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      expect(getSession()).toBeNull();
    });
  });

  // ─── saveSession ─────────────────────────────────────────────────────────

  describe('saveSession', () => {
    it('saves session to localStorage', () => {
      const session = {
        userId: 'u1',
        username: 'janedoe',
        displayName: 'Jane Doe',
        role: 'user',
      };
      saveSession(session);
      expect(JSON.parse(localStorage.getItem('writespace_session'))).toEqual(session);
    });

    it('does not throw when localStorage.setItem fails', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() =>
        saveSession({ userId: 'u1', username: 'x', displayName: 'X', role: 'user' })
      ).not.toThrow();
      consoleSpy.mockRestore();
    });
  });

  // ─── clearSession ────────────────────────────────────────────────────────

  describe('clearSession', () => {
    it('removes session from localStorage', () => {
      saveSession({
        userId: 'u1',
        username: 'janedoe',
        displayName: 'Jane Doe',
        role: 'user',
      });
      expect(getSession()).not.toBeNull();
      clearSession();
      expect(getSession()).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => clearSession()).not.toThrow();
    });

    it('does not throw when localStorage.removeItem fails', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage unavailable');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => clearSession()).not.toThrow();
      consoleSpy.mockRestore();
    });
  });

  // ─── Integration: multiple operations ────────────────────────────────────

  describe('integration', () => {
    it('supports adding multiple posts and retrieving them', () => {
      addPost({ title: 'Post 1', content: 'Content 1', authorId: 'u1', authorName: 'A' });
      addPost({ title: 'Post 2', content: 'Content 2', authorId: 'u2', authorName: 'B' });
      addPost({ title: 'Post 3', content: 'Content 3', authorId: 'u1', authorName: 'A' });
      expect(getPosts()).toHaveLength(3);
    });

    it('supports adding multiple users and retrieving them', () => {
      addUser({ displayName: 'User 1', username: 'user1', password: 'password1', role: 'user' });
      addUser({ displayName: 'User 2', username: 'user2', password: 'password2', role: 'user' });
      expect(getUsers()).toHaveLength(2);
    });

    it('each post gets a unique id', () => {
      const post1 = addPost({ title: 'P1', content: 'C1', authorId: 'u1', authorName: 'A' });
      const post2 = addPost({ title: 'P2', content: 'C2', authorId: 'u1', authorName: 'A' });
      expect(post1.id).not.toBe(post2.id);
    });

    it('each user gets a unique id', () => {
      const user1 = addUser({ displayName: 'U1', username: 'user1', password: 'password1', role: 'user' });
      const user2 = addUser({ displayName: 'U2', username: 'user2', password: 'password2', role: 'user' });
      expect(user1.id).not.toBe(user2.id);
    });

    it('session persists across getSession calls', () => {
      const session = { userId: 'u1', username: 'test', displayName: 'Test', role: 'user' };
      saveSession(session);
      expect(getSession()).toEqual(session);
      expect(getSession()).toEqual(session);
    });

    it('clearSession makes getSession return null', () => {
      saveSession({ userId: 'u1', username: 'test', displayName: 'Test', role: 'user' });
      clearSession();
      expect(getSession()).toBeNull();
    });
  });
});