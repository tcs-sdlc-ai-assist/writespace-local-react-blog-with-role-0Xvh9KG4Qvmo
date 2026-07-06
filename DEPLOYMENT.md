# Deployment Guide

This document covers deploying WriteSpace to [Vercel](https://vercel.com/) as a static single-page application (SPA).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Requirements](#environment-requirements)
- [Build Commands](#build-commands)
- [Vercel Deployment](#vercel-deployment)
  - [SPA Rewrite Configuration](#spa-rewrite-configuration)
  - [Manual Deployment via Vercel CLI](#manual-deployment-via-vercel-cli)
  - [Automatic Deployment via Git Integration](#automatic-deployment-via-git-integration)
- [CI/CD Notes](#cicd-notes)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node.js)
- A [Vercel](https://vercel.com/) account (free tier is sufficient)
- A Git repository hosted on GitHub, GitLab, or Bitbucket

## Environment Requirements

WriteSpace is a fully client-side application that uses `localStorage` for data persistence. There are no server-side environment variables or external API keys required.

| Requirement       | Version / Detail          |
| ----------------- | ------------------------- |
| Node.js           | v18 or higher             |
| npm               | v9 or higher (ships with Node.js 18+) |
| Build tool        | Vite 5                    |
| Output directory  | `dist/`                   |
| Framework preset  | Vite (auto-detected by Vercel) |

> **Note:** This project does not use any `VITE_*` environment variables. If you extend the application with external services in the future, define them in Vercel's project settings under **Settings → Environment Variables** and access them via `import.meta.env.VITE_*` in your source code.

## Build Commands

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The dev server starts at [http://localhost:3000](http://localhost:3000) and opens automatically.

### Create a production build

```bash
npm run build
```

This generates optimized static assets in the `dist/` directory with sourcemaps enabled.

### Preview the production build locally

```bash
npm run preview
```

### Run the test suite

```bash
npm test
```

Always run tests before deploying to catch regressions early.

## Vercel Deployment

### SPA Rewrite Configuration

WriteSpace uses client-side routing via React Router v6. All navigation is handled in the browser, so the server must return `index.html` for every route. The included `vercel.json` file configures this:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures that direct URL access to routes like `/blogs`, `/write`, `/dashboard`, or `/blog/:id` correctly loads the application instead of returning a 404 error.

> **Important:** Do not remove or modify `vercel.json` unless you are replacing the rewrite strategy. Without this configuration, refreshing the browser on any route other than `/` will result in a 404 page.

### Manual Deployment via Vercel CLI

1. **Install the Vercel CLI globally:**

   ```bash
   npm install -g vercel
   ```

2. **Log in to your Vercel account:**

   ```bash
   vercel login
   ```

3. **Deploy from the project root:**

   ```bash
   vercel
   ```

   The CLI will prompt you to configure the project. Accept the defaults or customize as needed:

   | Prompt                        | Recommended Value |
   | ----------------------------- | ----------------- |
   | Set up and deploy?            | Yes               |
   | Which scope?                  | Your account      |
   | Link to existing project?     | No (first deploy) |
   | Project name                  | `writespace`      |
   | In which directory is your code? | `./`           |
   | Override build settings?      | No                |

   Vercel auto-detects the Vite framework preset and uses the following defaults:

   - **Build Command:** `vite build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Deploy to production:**

   ```bash
   vercel --prod
   ```

### Automatic Deployment via Git Integration

This is the recommended approach for team workflows and continuous deployment.

1. **Push your repository** to GitHub, GitLab, or Bitbucket.

2. **Import the project in Vercel:**
   - Go to [https://vercel.com/new](https://vercel.com/new)
   - Select your Git provider and authorize access
   - Choose the WriteSpace repository
   - Vercel auto-detects the Vite framework preset

3. **Verify the build settings:**

   | Setting           | Value         |
   | ----------------- | ------------- |
   | Framework Preset  | Vite          |
   | Build Command     | `vite build`  |
   | Output Directory  | `dist`        |
   | Install Command   | `npm install` |

4. **Click Deploy.**

Once connected, Vercel automatically deploys on every push:

- **Production deployments** are triggered by pushes to the `main` (or `master`) branch.
- **Preview deployments** are triggered by pushes to any other branch or by opening a pull request. Each preview deployment gets a unique URL for testing.

## CI/CD Notes

### Automatic Deployments on Git Push

With Vercel's Git integration enabled:

- Every push to `main` triggers a **production deployment** at your custom domain or `*.vercel.app` URL.
- Every push to a feature branch triggers a **preview deployment** with a unique URL (e.g., `writespace-<hash>.vercel.app`).
- Every pull request receives a **deployment preview comment** with a link to the preview URL.

### Running Tests Before Deployment

Vercel does not run your test suite by default during the build step. To ensure tests pass before deployment, you have two options:

#### Option A: Override the build command in Vercel

Set the build command in Vercel's project settings to run tests before building:

```
npm test -- --run && vite build
```

The `--run` flag ensures Vitest runs once and exits (instead of entering watch mode).

#### Option B: Use a CI pipeline (GitHub Actions)

Create `.github/workflows/ci.yml` to run tests on every push and pull request:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --run

      - name: Build
        run: npm run build
```

This ensures that failing tests block the pipeline. Vercel will still handle the actual deployment independently, but you can configure Vercel to require CI checks to pass before promoting a preview to production.

### Branch Protection (Recommended)

For team projects, enable branch protection rules on `main`:

- Require pull request reviews before merging
- Require status checks to pass (link the CI workflow above)
- Require branches to be up to date before merging

This prevents broken code from reaching production.

## Troubleshooting

### 404 errors on page refresh

**Cause:** The SPA rewrite rule is missing or misconfigured.

**Fix:** Ensure `vercel.json` exists in the project root with the following content:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Build fails with missing dependencies

**Cause:** Dependencies are not installed or `package-lock.json` is out of date.

**Fix:** Run `npm install` locally, commit the updated `package-lock.json`, and push again.

### Blank page after deployment

**Cause:** The `dist/` directory was not generated correctly, or the base path is misconfigured.

**Fix:**
1. Run `npm run build` locally and verify the `dist/` directory contains `index.html` and an `assets/` folder.
2. Ensure `vite.config.js` does not set a `base` path unless your deployment requires one (the default `/` is correct for Vercel root deployments).

### Tests fail in CI but pass locally

**Cause:** Tests may depend on browser APIs or localStorage state from a previous run.

**Fix:**
1. Ensure each test clears `localStorage` in `beforeEach` and `afterEach` hooks (already implemented in the existing test suite).
2. Verify the CI environment uses Node.js v18 or higher.
3. Run `npm test -- --run` locally to simulate the CI single-run behavior.

### Preview deployment shows stale content

**Cause:** Browser caching or Vercel edge caching.

**Fix:** Hard-refresh the browser (`Ctrl+Shift+R` or `Cmd+Shift+R`) or append a query parameter to the URL to bypass the cache.