import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { getPosts, deletePost } from '../utils/storage.js';
import { Navbar } from '../components/Navbar.jsx';
import { Avatar } from '../components/Avatar.jsx';

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const admin = isAdmin();

  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const posts = getPosts();
    const found = posts.find((p) => p.id === id);
    if (found) {
      setPost(found);
    } else {
      setNotFound(true);
    }
  }, [id]);

  const isOwner = currentUser && post && currentUser.userId === post.authorId;
  const canEdit = admin || isOwner;
  const canDelete = admin || isOwner;

  const handleEdit = () => {
    navigate('/write', { state: { editPost: post } });
  };

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    try {
      deletePost(post.id);
      navigate('/blogs', { replace: true });
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-5xl mb-4">
              <span role="img" aria-hidden="true">
                🔍
              </span>
            </div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Post not found
            </h1>
            <p className="text-secondary-500 mb-6">
              The post you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/blogs')}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              Back to Blogs
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <p className="text-secondary-500">Loading…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-serif text-secondary-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <Avatar
                  role={admin && post.authorId === currentUser?.userId ? 'admin' : 'user'}
                  size="md"
                />
                <div>
                  <p className="text-sm font-medium text-secondary-700">
                    {post.authorName}
                  </p>
                  <p className="text-xs text-secondary-400">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
              {(canEdit || canDelete) && (
                <div className="flex items-center space-x-2">
                  {canEdit && (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                      aria-label={`Edit post: ${post.title}`}
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      aria-label={`Delete post: ${post.title}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-secondary-100 pt-6">
            <div className="text-secondary-700 text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate('/blogs')}
            className="text-sm font-medium text-secondary-500 hover:text-primary-600 transition-colors"
          >
            ← Back to all posts
          </button>
        </div>
      </main>

      {showConfirm && (
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
                Are you sure you want to delete this post? This action cannot be undone.
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

export default ReadBlog;