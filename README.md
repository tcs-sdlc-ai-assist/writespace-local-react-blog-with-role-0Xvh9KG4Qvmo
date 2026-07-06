# WriteSpace

A modern writing platform built with React, Vite, and Tailwind CSS. Share your stories, explore ideas, and connect through the power of words.

## Tech Stack

- **React 18** — UI library
- **Vite 5** — Build tool and dev server
- **Tailwind CSS 3** — Utility-first CSS framework
- **React Router v6** — Client-side routing
- **Vitest** — Unit and integration testing
- **localStorage** — Client-side data persistence

## Features

- **Public Landing Page** — Hero section, feature highlights, and latest community posts
- **Authentication** — Login and registration with session persistence via localStorage
- **Role-Based Access Control** — Admin and user roles with protected routes
- **Blog CRUD** — Create, read, edit, and delete blog posts with validation
- **Admin Dashboard** — Platform statistics, recent posts management, and quick actions
- **User Management** — Admin-only user creation, deletion, and role assignment
- **Responsive Design** — Mobile-first layout with Tailwind CSS utility classes
- **Hard-coded Admin Account** — Default admin credentials for initial setup

## Folder Structure

```
writespace/
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── src/
│   ├── main.jsx                  # App entry point
│   ├── App.jsx                   # Root component with routing
│   ├── App.test.jsx              # Integration tests
│   ├── index.css                 # Tailwind directives
│   ├── setupTests.js             # Test setup (jest-dom)
│   ├── components/
│   │   ├── Avatar.jsx            # User avatar with role-based emoji
│   │   ├── BlogCard.jsx          # Blog post card for listings
│   │   ├── Navbar.jsx            # Authenticated navigation bar
│   │   ├── PublicNavbar.jsx      # Public navigation bar
│   │   ├── ProtectedRoute.jsx    # Route guard for auth and admin
│   │   ├── StatCard.jsx          # Dashboard statistic card
│   │   └── UserRow.jsx           # User list row for management
│   ├── pages/
│   │   ├── AdminDashboard.jsx    # Admin overview and stats
│   │   ├── Home.jsx              # Blog listing page
│   │   ├── LandingPage.jsx       # Public landing page
│   │   ├── LoginPage.jsx         # Login form
│   │   ├── ReadBlog.jsx          # Single blog post view
│   │   ├── RegisterPage.jsx      # Registration form
│   │   ├── UserManagement.jsx    # Admin user management
│   │   └── WriteBlog.jsx         # Create and edit blog posts
│   └── utils/
│       ├── auth.js               # Authentication logic
│       ├── auth.test.js          # Auth utility tests
│       ├── storage.js            # localStorage CRUD operations
│       └── storage.test.js       # Storage utility tests
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (included with Node.js)

### Installation

```bash
git clone <repository-url>
cd writespace
npm install
```

### Development

Start the development server on port 3000:

```bash
npm run dev
```

The app will open automatically at [http://localhost:3000](http://localhost:3000).

### Build

Create a production build in the `dist/` directory:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Testing

Run the test suite with Vitest:

```bash
npm test
```

## Default Admin Account

The application ships with a hard-coded admin account for initial access:

| Field    | Value      |
| -------- | ---------- |
| Username | `admin`    |
| Password | `admin123` |

Admin users are redirected to `/dashboard` on login. Regular users are redirected to `/blogs`.

## Usage Guide

### Public Visitors

1. Visit the landing page to see featured content and latest posts
2. Click **Get Started** to create an account or **Sign In** to log in

### Registered Users

1. Browse all community posts at `/blogs`
2. Click **Write Post** to create a new blog post
3. Click on any post title to read the full content
4. Edit or delete your own posts from the post detail page

### Admin Users

1. Access the **Dashboard** at `/dashboard` for platform statistics
2. Manage users at `/users` — create new accounts or remove existing ones
3. Edit or delete any post across the platform
4. The default admin account cannot be deleted

## Routes

| Path           | Access          | Description                  |
| -------------- | --------------- | ---------------------------- |
| `/`            | Public          | Landing page                 |
| `/login`       | Public          | Login form                   |
| `/register`    | Public          | Registration form            |
| `/blogs`       | Authenticated   | Blog listing                 |
| `/write`       | Authenticated   | Create a new post            |
| `/edit/:id`    | Authenticated   | Edit an existing post        |
| `/blog/:id`    | Authenticated   | Read a single post           |
| `/dashboard`   | Admin only      | Admin dashboard              |
| `/users`       | Admin only      | User management              |

## Data Persistence

All data is stored in the browser's localStorage under the following keys:

- `writespace_posts` — Blog post data
- `writespace_users` — User account data
- `writespace_session` — Current session data

Clearing localStorage will reset all application data.

## Deployment on Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket
2. Import the project in [Vercel](https://vercel.com/)
3. Vercel will auto-detect the Vite framework preset
4. The included `vercel.json` handles SPA rewrites for client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

5. Click **Deploy** — no additional configuration is required

## License

Private