import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { isAuthenticated } from './utils/auth.js';
import { PublicNavbar } from './components/PublicNavbar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { Home } from './pages/Home.jsx';
import { WriteBlog } from './pages/WriteBlog.jsx';
import { ReadBlog } from './pages/ReadBlog.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { UserManagement } from './pages/UserManagement.jsx';

const publicRoutes = ['/', '/login', '/register'];

function AppLayout() {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const showPublicNavbar = !authenticated && isPublicRoute && location.pathname !== '/login' && location.pathname !== '/register';

  return (
    <>
      {showPublicNavbar && <PublicNavbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/blogs" element={<Home />} />
          <Route path="/write" element={<WriteBlog />} />
          <Route path="/edit/:id" element={<WriteBlog />} />
          <Route path="/blog/:id" element={<ReadBlog />} />
        </Route>
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<UserManagement />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;