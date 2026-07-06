import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { getPosts, addPost, updatePost } from '../utils/storage.js';
import { Navbar } from '../components/Navbar.jsx';

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;

export function WriteBlog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const admin = isAdmin();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPostId, setEditPostId] = useState(null);

  useEffect(() => {
    // Check if editing via route state (from BlogCard edit button)
    const editPost = location.state?.editPost;

    if (editPost) {
      // Ownership check
      const isOwner = currentUser && currentUser.userId === editPost.authorId;
      if (!admin && !isOwner) {
        navigate('/blogs', { replace: true });
        return;
      }
      setTitle(editPost.title);
      setContent(editPost.content);
      setIsEditing(true);
      setEditPostId(editPost.id);
      return;
    }

    // Check if editing via URL param /edit/:id
    if (id) {
      const posts = getPosts();
      const post = posts.find((p) => p.id === id);
      if (!post) {
        navigate('/blogs', { replace: true });
        return;
      }
      const isOwner = currentUser && currentUser.userId === post.authorId;
      if (!admin && !isOwner) {
        navigate('/blogs', { replace: true });
        return;
      }
      setTitle(post.title);
      setContent(post.content);
      setIsEditing(true);
      setEditPostId(post.id);
    }
  }, [id, location.state, currentUser, admin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.trim().length > TITLE_MAX) {
      setError(`Title must be ${TITLE_MAX} characters or less`);
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (content.trim().length > CONTENT_MAX) {
      setError(`Content must be ${CONTENT_MAX} characters or less`);
      return;
    }

    setLoading(true);

    try {
      if (isEditing && editPostId) {
        updatePost(editPostId, { title, content });
        navigate(`/blog/${editPostId}`, { replace: true });
      } else {
        const newPost = addPost({
          title,
          content,
          authorId: currentUser.userId,
          authorName: currentUser.displayName,
        });
        navigate(`/blog/${newPost.id}`, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving the post');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && editPostId) {
      navigate(`/blog/${editPostId}`);
    } else {
      navigate('/blogs');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif text-secondary-900">
            {isEditing ? 'Edit Post' : 'Write a New Post'}
          </h1>
          <p className="mt-1 text-secondary-500">
            {isEditing
              ? 'Update your post below'
              : 'Share your thoughts with the community'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-secondary-700 mb-1.5"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title"
                className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={loading}
                maxLength={TITLE_MAX}
              />
              <div className="mt-1 flex justify-end">
                <span
                  className={`text-xs ${
                    title.trim().length > TITLE_MAX
                      ? 'text-red-500'
                      : 'text-secondary-400'
                  }`}
                >
                  {title.trim().length}/{TITLE_MAX}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-secondary-700 mb-1.5"
              >
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                rows={12}
                className="w-full px-4 py-2.5 border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-y"
                disabled={loading}
                maxLength={CONTENT_MAX}
              />
              <div className="mt-1 flex justify-end">
                <span
                  className={`text-xs ${
                    content.trim().length > CONTENT_MAX
                      ? 'text-red-500'
                      : 'text-secondary-400'
                  }`}
                >
                  {content.trim().length}/{CONTENT_MAX}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium text-secondary-600 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                  loading
                    ? 'bg-primary-400 text-white cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {loading
                  ? isEditing
                    ? 'Saving…'
                    : 'Publishing…'
                  : isEditing
                    ? 'Save Changes'
                    : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default WriteBlog;