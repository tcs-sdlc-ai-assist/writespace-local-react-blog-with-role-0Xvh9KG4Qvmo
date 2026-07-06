import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts, getUsers, deletePost } from '../utils/storage.js';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { Navbar } from '../components/Navbar.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { BlogCard } from '../components/BlogCard.jsx';

export function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const admin = isAdmin();

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    const allPosts = getPosts();
    const sorted = allPosts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setPosts(sorted);
    setUsers(getUsers());
  }, []);

  const totalPosts = posts.length;
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  const recentPosts = posts.slice(0, 5);

  const handleEdit = (post) => {
    navigate('/write', { state: { editPost: post } });
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    if (!postToDelete) return;
    try {
      deletePost(postToDelete.id);
      const updatedPosts = getPosts().sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
    setShowConfirm(false);
    setPostToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setPostToDelete(null);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gradient Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 sm:p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold font-serif mb-2">
            Admin Dashboard
          </h1>
          <p className="text-primary-100">
            Welcome back, {currentUser?.displayName}. Here&apos;s an overview of your platform.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Posts"
            count={totalPosts}
            icon="📝"
            bgColor="bg-indigo-100"
          />
          <StatCard
            title="Total Users"
            count={totalUsers}
            icon="👥"
            bgColor="bg-violet-100"
          />
          <StatCard
            title="Admins"
            count={adminCount}
            icon="👑"
            bgColor="bg-amber-100"
          />
          <StatCard
            title="Users"
            count={userCount}
            icon="📖"
            bgColor="bg-emerald-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/write')}
            className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            Write Post
          </button>
          <button
            onClick={() => navigate('/users')}
            className="px-5 py-2.5 bg-white text-primary-600 text-sm font-medium rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors shadow-sm"
          >
            Manage Users
          </button>
        </div>

        {/* Recent Posts */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold font-serif text-secondary-900">
                Recent Posts
              </h2>
              <p className="mt-1 text-secondary-500">
                Latest posts from the community
              </p>
            </div>
            <button
              onClick={() => navigate('/blogs')}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View All →
            </button>
          </div>

          {recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <div key={post.id} className="relative">
                  <BlogCard
                    post={post}
                    onEdit={handleEdit}
                  />
                  <button
                    onClick={() => handleDeleteClick(post)}
                    className="absolute top-3 right-3 p-1.5 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Delete post: ${post.title}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">
                <span role="img" aria-hidden="true">
                  📝
                </span>
              </div>
              <h2 className="text-xl font-bold text-secondary-900 mb-2">
                No posts yet
              </h2>
              <p className="text-secondary-500 mb-6">
                Get started by creating the first post on WriteSpace!
              </p>
              <button
                onClick={() => navigate('/write')}
                className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                Start Writing
              </button>
            </div>
          )}
        </div>
      </main>

      {showConfirm && postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">
                <span role="img" aria-hidden="true">
                  ⚠️
                </span>
              </div>
              <h2 className="text-lg font-bold text-secondary-900 mb-1">
                Delete Post
              </h2>
              <p className="text-sm text-secondary-500">
                Are you sure you want to delete &ldquo;{postToDelete.title}&rdquo;? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={cancelDelete}
                className="px-5 py-2.5 text-sm font-medium text-secondary-600 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;