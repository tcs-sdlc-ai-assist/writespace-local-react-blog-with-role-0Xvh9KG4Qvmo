const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';
const SESSION_KEY = 'writespace_session';

/**
 * Generate a unique ID string
 * @returns {string} A unique identifier
 */
function generateId() {
  return Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

// ─── Posts ───────────────────────────────────────────────────────────────────

/**
 * Retrieve all posts from localStorage
 * @returns {Array<Object>} Array of post objects
 */
export function getPosts() {
  try {
    const data = localStorage.getItem(POSTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save the entire posts array to localStorage
 * @param {Array<Object>} posts - Array of post objects to persist
 */
export function savePosts(posts) {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to save posts:', error);
  }
}

/**
 * Add a new post to localStorage
 * @param {Object} post - Post object with title, content, authorId, authorName
 * @returns {Object} The created post with id and createdAt
 * @throws {Error} If title or content is missing or exceeds limits
 */
export function addPost(post) {
  if (!post.title || !post.title.trim()) {
    throw new Error('Title is required');
  }
  if (!post.content || !post.content.trim()) {
    throw new Error('Content is required');
  }
  if (post.title.trim().length > 100) {
    throw new Error('Title must be 100 characters or less');
  }
  if (post.content.trim().length > 5000) {
    throw new Error('Content must be 5000 characters or less');
  }

  const posts = getPosts();
  const newPost = {
    id: generateId(),
    title: post.title.trim(),
    content: post.content.trim(),
    authorId: post.authorId,
    authorName: post.authorName,
    createdAt: new Date().toISOString(),
  };
  posts.push(newPost);
  savePosts(posts);
  return newPost;
}

/**
 * Update an existing post by id
 * @param {string} postId - The id of the post to update
 * @param {Object} updatedFields - Fields to merge into the existing post
 * @returns {Object} The updated post object
 * @throws {Error} If post is not found or validation fails
 */
export function updatePost(postId, updatedFields) {
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) {
    throw new Error('Post not found');
  }

  if (updatedFields.title !== undefined) {
    if (!updatedFields.title || !updatedFields.title.trim()) {
      throw new Error('Title is required');
    }
    if (updatedFields.title.trim().length > 100) {
      throw new Error('Title must be 100 characters or less');
    }
    updatedFields.title = updatedFields.title.trim();
  }

  if (updatedFields.content !== undefined) {
    if (!updatedFields.content || !updatedFields.content.trim()) {
      throw new Error('Content is required');
    }
    if (updatedFields.content.trim().length > 5000) {
      throw new Error('Content must be 5000 characters or less');
    }
    updatedFields.content = updatedFields.content.trim();
  }

  posts[index] = { ...posts[index], ...updatedFields };
  savePosts(posts);
  return posts[index];
}

/**
 * Delete a post by id
 * @param {string} postId - The id of the post to delete
 * @throws {Error} If post is not found
 */
export function deletePost(postId) {
  const posts = getPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) {
    throw new Error('Post not found');
  }
  savePosts(posts.filter((p) => p.id !== postId));
}

// ─── Users ───────────────────────────────────────────────────────────────────

/**
 * Retrieve all users from localStorage
 * @returns {Array<Object>} Array of user objects
 */
export function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save the entire users array to localStorage
 * @param {Array<Object>} users - Array of user objects to persist
 */
export function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
}

/**
 * Add a new user to localStorage
 * @param {Object} user - User object with displayName, username, password, role
 * @returns {Object} The created user with id and createdAt
 * @throws {Error} If validation fails or username already exists
 */
export function addUser(user) {
  if (!user.displayName || !user.displayName.trim()) {
    throw new Error('Display name is required');
  }
  if (!user.username || !user.username.trim()) {
    throw new Error('Username is required');
  }
  if (user.username.trim().length < 3) {
    throw new Error('Username must be at least 3 characters');
  }
  if (!user.password || user.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const users = getUsers();
  if (users.some((u) => u.username === user.username.trim())) {
    throw new Error('Username already exists');
  }

  const newUser = {
    id: generateId(),
    displayName: user.displayName.trim(),
    username: user.username.trim(),
    password: user.password,
    role: user.role || 'user',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

/**
 * Delete a user by id
 * @param {string} userId - The id of the user to delete
 * @throws {Error} If user is not found, is the hard-coded admin, or is the current session user
 */
export function deleteUser(userId) {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (user.role === 'admin' && user.username === 'admin') {
    throw new Error('Cannot delete the default admin account');
  }
  const session = getSession();
  if (session && session.userId === userId) {
    throw new Error('Cannot delete your own account');
  }
  saveUsers(users.filter((u) => u.id !== userId));
}

// ─── Session ─────────────────────────────────────────────────────────────────

/**
 * Retrieve the current session from localStorage
 * @returns {Object|null} Session object or null if not logged in
 */
export function getSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Save a session to localStorage
 * @param {Object} session - Session object with userId, username, displayName, role
 */
export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

/**
 * Clear the current session from localStorage
 */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}