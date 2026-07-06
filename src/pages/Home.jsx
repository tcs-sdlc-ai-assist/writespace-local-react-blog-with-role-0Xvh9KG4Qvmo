import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../utils/storage.js';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { BlogCard } from '../components/BlogCard.jsx';
import { Navbar } from '../components/Navbar.jsx';

export function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const currentUser = getCurrentUser();
  const admin = isAdmin();

  useEffect(() => {
    const allPosts = getPosts();
    const sorted = allPosts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setPosts(sorted);
  }, []);

  const handleEdit = (post) => {
    navigate(`/write`, { state: { editPost: post } });
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif text-secondary-900">
              All Posts
            </h1>
            <p className="mt-1 text-secondary-500">
              Discover stories from our community
            </p>
          </div>
          <button
            onClick={() => navigate('/write')}
            className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            Write Post
          </button>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onEdit={
                  admin || (currentUser && currentUser.userId === post.authorId)
                    ? handleEdit
                    : undefined
                }
              />
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
              Be the first to share your story on WriteSpace!
            </p>
            <button
              onClick={() => navigate('/write')}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              Start Writing
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;