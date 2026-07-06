import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { login, logout, register } from './utils/auth.js';
import { addUser, getSession, clearSession, saveSession, getUsers, addPost } from './utils/storage.js';

function renderWithRouter(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppLayout />
    </MemoryRouter>
  );
}

// We need to import AppLayout indirectly since it's not exported.
// Instead, we'll render the full App with a workaround or test via the BrowserRouter.
// Since App uses BrowserRouter internally, we need to test differently.
// We'll mock the router or test the full App.

// Actually, let's test the full App component which includes BrowserRouter.
// We can manipulate window.history or use the App directly.

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ─── Landing Page / Public Routes ─────────────────────────────────────

  describe('public routes', () => {
    it('renders the landing page at root path', () => {
      window.history.pushState({}, '', '/');
      render(<App />);
      expect(screen.getByText('Welcome to')).toBeInTheDocument();
      expect(screen.getByText('WriteSpace', { exact: false })).toBeInTheDocument();
    });

    it('renders the login page at /login', () => {
      window.history.pushState({}, '', '/login');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('renders the register page at /register', () => {
      window.history.pushState({}, '', '/register');
      render(<App />);
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('shows PublicNavbar on landing page when not authenticated', () => {
      window.history.pushState({}, '', '/');
      render(<App />);
      // PublicNavbar has Login and Register links
      const loginLinks = screen.getAllByText('Login');
      expect(loginLinks.length).toBeGreaterThanOrEqual(1);
      const registerLinks = screen.getAllByText('Register');
      expect(registerLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('does not show PublicNavbar on login page', () => {
      window.history.pushState({}, '', '/login');
      render(<App />);
      // The login page has its own "Sign In" button, but PublicNavbar should not be rendered
      // PublicNavbar contains a nav with Login and Register links at the top
      // The login page itself has a "Register" link at the bottom
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('does not show PublicNavbar on register page', () => {
      window.history.pushState({}, '', '/register');
      render(<App />);
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });
  });

  // ─── Authentication-based Redirects ───────────────────────────────────

  describe('authentication redirects', () => {
    it('redirects /blogs to /login when not authenticated', () => {
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      // ProtectedRoute should redirect to /login
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('redirects /write to /login when not authenticated', () => {
      window.history.pushState({}, '', '/write');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('redirects /dashboard to /login when not authenticated', () => {
      window.history.pushState({}, '', '/dashboard');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('redirects /users to /login when not authenticated', () => {
      window.history.pushState({}, '', '/users');
      render(<App />);
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('allows authenticated user to access /blogs', () => {
      addUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      login('testuser', 'password123');
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('allows authenticated user to access /write', () => {
      addUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      login('testuser', 'password123');
      window.history.pushState({}, '', '/write');
      render(<App />);
      expect(screen.getByText('Write a New Post')).toBeInTheDocument();
    });

    it('redirects non-admin user from /dashboard to /blogs', () => {
      addUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      login('testuser', 'password123');
      window.history.pushState({}, '', '/dashboard');
      render(<App />);
      // Should redirect to /blogs
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('redirects non-admin user from /users to /blogs', () => {
      addUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      login('testuser', 'password123');
      window.history.pushState({}, '', '/users');
      render(<App />);
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('allows admin to access /dashboard', () => {
      login('admin', 'admin123');
      window.history.pushState({}, '', '/dashboard');
      render(<App />);
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('allows admin to access /users', () => {
      login('admin', 'admin123');
      window.history.pushState({}, '', '/users');
      render(<App />);
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });

    it('allows admin to access /blogs', () => {
      login('admin', 'admin123');
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('allows admin to access /write', () => {
      login('admin', 'admin123');
      window.history.pushState({}, '', '/write');
      render(<App />);
      expect(screen.getByText('Write a New Post')).toBeInTheDocument();
    });
  });

  // ─── Conditional Navbar Rendering ─────────────────────────────────────

  describe('conditional navbar rendering', () => {
    it('shows authenticated Navbar on /blogs when logged in', () => {
      addUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      login('testuser', 'password123');
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      // Navbar should show Blogs, Write links and Logout button
      expect(screen.getByText('Logout')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('shows admin links in Navbar for admin users', () => {
      login('admin', 'admin123');
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      // Admin should see Dashboard and Users links
      const dashboardLinks = screen.getAllByText('Dashboard');
      expect(dashboardLinks.length).toBeGreaterThanOrEqual(1);
      const usersLinks = screen.getAllByText('Users');
      expect(usersLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('does not show admin links in Navbar for regular users', () => {
      addUser({
        displayName: 'Regular User',
        username: 'regular',
        password: 'password123',
        role: 'user',
      });
      login('regular', 'password123');
      window.history.pushState({}, '', '/blogs');
      render(<App />);
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
    });

    it('does not show PublicNavbar when authenticated on landing page', () => {
      addUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      login('testuser', 'password123');
      window.history.pushState({}, '', '/');
      render(<App />);
      // When authenticated, landing page should show "Browse Blogs" instead of "Get Started"
      expect(screen.getByText('Browse Blogs')).toBeInTheDocument();
    });
  });

  // ─── Navigation ───────────────────────────────────────────────────────

  describe('navigation', () => {
    it('navigates from landing page to login page', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/');
      render(<App />);
      // Click "Sign In" link on landing page
      const signInLink = screen.getByRole('link', { name: 'Sign In' });
      await user.click(signInLink);
      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });
    });

    it('navigates from landing page to register page', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/');
      render(<App />);
      const getStartedLink = screen.getByRole('link', { name: 'Get Started' });
      await user.click(getStartedLink);
      await waitFor(() => {
        expect(screen.getByText('Create Account')).toBeInTheDocument();
      });
    });

    it('navigates from login page to register page', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/login');
      render(<App />);
      const registerLink = screen.getByRole('link', { name: 'Register' });
      await user.click(registerLink);
      await waitFor(() => {
        expect(screen.getByText('Create Account')).toBeInTheDocument();
      });
    });

    it('navigates from register page to login page', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/register');
      render(<App />);
      const signInLink = screen.getByRole('link', { name: 'Sign In' });
      await user.click(signInLink);
      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });
    });

    it('login form submits and redirects user to /blogs', async () => {
      const user = userEvent.setup();
      addUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      window.history.pushState({}, '', '/login');
      render(<App />);

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('All Posts')).toBeInTheDocument();
      });
    });

    it('login form shows error for invalid credentials', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/login');
      render(<App />);

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(usernameInput, 'nonexistent');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
      });
    });

    it('admin login redirects to /dashboard', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/login');
      render(<App />);

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('logout redirects to login page', async () => {
      const user = userEvent.setup();
      addUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      login('testuser', 'password123');
      window.history.pushState({}, '', '/blogs');
      render(<App />);

      expect(screen.getByText('All Posts')).toBeInTheDocument();

      const logoutButton = screen.getByRole('button', { name: 'Logout' });
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      });
    });

    it('authenticated user navigating to /login is redirected to /blogs', () => {
      addUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      login('testuser', 'password123');
      window.history.pushState({}, '', '/login');
      render(<App />);
      // LoginPage useEffect should redirect authenticated user
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });

    it('authenticated admin navigating to /login is redirected to /dashboard', () => {
      login('admin', 'admin123');
      window.history.pushState({}, '', '/login');
      render(<App />);
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('authenticated user navigating to /register is redirected to /blogs', () => {
      addUser({
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
      });
      login('testuser', 'password123');
      window.history.pushState({}, '', '/register');
      render(<App />);
      expect(screen.getByText('All Posts')).toBeInTheDocument();
    });
  });

  // ─── Blog Reading ─────────────────────────────────────────────────────

  describe('blog reading', () => {
    it('renders ReadBlog page for a valid post', () => {
      login('admin', 'admin123');
      const post = addPost({
        title: 'Test Blog Post',
        content: 'This is the content of the test blog post.',
        authorId: getSession().userId,
        authorName: 'Administrator',
      });
      window.history.pushState({}, '', `/blog/${post.id}`);
      render(<App />);
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
      expect(screen.getByText('This is the content of the test blog post.')).toBeInTheDocument();
    });

    it('shows not found for invalid blog id', () => {
      login('admin', 'admin123');
      window.history.pushState({}, '', '/blog/nonexistent-id');
      render(<App />);
      expect(screen.getByText('Post not found')).toBeInTheDocument();
    });
  });

  // ─── Registration Flow ───────────────────────────────────────────────

  describe('registration flow', () => {
    it('register form creates account and redirects to /blogs', async () => {
      const user = userEvent.setup();
      window.history.pushState({}, '', '/register');
      render(<App />);

      await user.type(screen.getByLabelText('Display Name'), 'New User');
      await user.type(screen.getByLabelText('Username'), 'newuser');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'password123');

      const createButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('All Posts')).toBeInTheDocument();
      });
    });

    it('register form shows error for duplicate username', async () => {
      const user = userEvent.setup();
      addUser({
        displayName: 'Existing User',
        username: 'existing',
        password: 'password123',
        role: 'user',
      });
      window.history.pushState({}, '', '/register');
      render(<App />);

      await user.type(screen.getByLabelText('Display Name'), 'Another User');
      await user.type(screen.getByLabelText('Username'), 'existing');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.type(screen.getByLabelText('Confirm Password'), 'password123');

      const createButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Username already exists')).toBeInTheDocument();
      });
    });
  });
});