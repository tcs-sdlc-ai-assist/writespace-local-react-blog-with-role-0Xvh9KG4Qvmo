# Changelog

All notable changes to the WriteSpace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added

- **Public Landing Page**
  - Hero section with call-to-action links for unauthenticated and authenticated visitors
  - Features section highlighting Write Freely, Share with the World, and Secure & Private
  - Latest Posts section displaying the three most recent community posts
  - Responsive footer with navigation links

- **Authentication**
  - Login page with username and password form, validation, and error handling
  - Register page with display name, username, password, and confirm password fields
  - Hard-coded default admin account (`admin` / `admin123`)
  - Session persistence via localStorage
  - Automatic redirect for authenticated users visiting login or register pages
  - Admin users redirected to `/dashboard` on login; regular users redirected to `/blogs`

- **Role-Based Access Control**
  - Protected routes requiring authentication for `/blogs`, `/write`, `/edit/:id`, and `/blog/:id`
  - Admin-only routes for `/dashboard` and `/users`
  - Non-admin users redirected to `/blogs` when attempting to access admin routes
  - Unauthenticated users redirected to `/login` when attempting to access protected routes

- **Blog CRUD Operations**
  - Create new blog posts with title (max 100 characters) and content (max 5000 characters)
  - Read individual blog posts with full content, author info, and publication date
  - Edit existing posts (available to post author and admin users)
  - Delete posts with confirmation modal (available to post author and admin users)
  - Blog listing page with cards showing truncated content, author avatar, and date
  - Posts sorted by creation date in descending order

- **Admin Dashboard**
  - Overview statistics: total posts, total users, admin count, and user count
  - Recent posts section with edit and delete capabilities
  - Quick action buttons for writing posts and managing users
  - Gradient banner with personalized welcome message

- **User Management**
  - Admin-only user management page at `/users`
  - Create new user accounts with role selection (user or admin)
  - Delete user accounts with confirmation modal
  - Protection against deleting the default admin account
  - Protection against deleting your own account
  - User list displaying avatar, display name, username, role badge, and join date

- **localStorage Persistence**
  - Posts stored under `writespace_posts` key
  - Users stored under `writespace_users` key
  - Session stored under `writespace_session` key
  - Graceful error handling for storage failures and invalid JSON

- **Responsive Tailwind CSS UI**
  - Custom color palette with primary and secondary color scales
  - Custom font families: Inter (sans), Merriweather (serif), Fira Code (mono)
  - Mobile-first responsive design with sm, md, and lg breakpoints
  - Consistent component styling: cards, buttons, forms, modals, navigation bars
  - Public navbar for unauthenticated landing page visitors
  - Authenticated navbar with role-based navigation links
  - Avatar component with role-based emoji indicators

- **Vercel SPA Deployment**
  - `vercel.json` configured with SPA rewrites for client-side routing
  - Vite build configuration with sourcemaps and dist output directory

- **Testing**
  - Unit tests for `storage.js` utility functions (posts, users, session CRUD)
  - Unit tests for `auth.js` utility functions (login, register, logout, session checks)
  - Integration tests for App component covering routing, authentication redirects, navigation flows, and conditional rendering
  - Test setup with Vitest, jsdom, React Testing Library, and user-event