import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth.js';
import { getPosts } from '../utils/storage.js';

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function truncateContent(content, maxLength = 120) {
  if (!content || content.length <= maxLength) {
    return content || '';
  }
  return content.substring(0, maxLength).trimEnd() + '…';
}

const features = [
  {
    icon: '✍️',
    title: 'Write Freely',
    description:
      'Express your thoughts with a clean, distraction-free writing experience. Focus on what matters — your words.',
  },
  {
    icon: '🌍',
    title: 'Share with the World',
    description:
      'Publish your posts and reach readers everywhere. Your stories deserve an audience.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description:
      'Your account and content are protected. Write with confidence knowing your work is safe.',
  },
];

export function LandingPage() {
  const authenticated = isAuthenticated();
  const allPosts = getPosts();
  const latestPosts = allPosts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20 sm:py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-secondary-900 mb-6">
            Welcome to{' '}
            <span className="text-primary-600">WriteSpace</span>
          </h1>
          <p className="text-lg sm:text-xl text-secondary-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A modern platform for writers and readers. Share your stories, explore
            ideas, and connect through the power of words.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {authenticated ? (
              <>
                <Link
                  to="/blogs"
                  className="px-8 py-3 bg-primary-600 text-white text-base font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Browse Blogs
                </Link>
                <Link
                  to="/write"
                  className="px-8 py-3 bg-white text-primary-600 text-base font-medium rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors shadow-sm"
                >
                  Start Writing
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-primary-600 text-white text-base font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-white text-primary-600 text-base font-medium rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors shadow-sm"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-secondary-900 mb-4">
              Why WriteSpace?
            </h2>
            <p className="text-secondary-500 text-lg max-w-xl mx-auto">
              Everything you need to write, publish, and grow your audience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-secondary-50 rounded-xl p-6 sm:p-8 text-center hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-4xl mb-4">
                  <span role="img" aria-hidden="true">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-16 sm:py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-secondary-900 mb-4">
              Latest Posts
            </h2>
            <p className="text-secondary-500 text-lg max-w-xl mx-auto">
              Discover what our community is writing about.
            </p>
          </div>
          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col"
                >
                  <div className="p-5 flex flex-col flex-1">
                    <Link
                      to={authenticated ? `/blog/${post.id}` : '/login'}
                      className="text-lg font-bold text-secondary-900 hover:text-primary-600 transition-colors line-clamp-2 mb-3"
                    >
                      {post.title}
                    </Link>
                    <p className="text-secondary-500 text-sm leading-relaxed mb-4 flex-1">
                      {truncateContent(post.content)}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-secondary-100">
                      <span className="text-sm font-medium text-secondary-700">
                        {post.authorName}
                      </span>
                      <span className="text-xs text-secondary-400">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">
                <span role="img" aria-hidden="true">
                  📝
                </span>
              </div>
              <p className="text-secondary-500 text-lg mb-2">
                No posts yet
              </p>
              <p className="text-secondary-400 text-sm">
                Be the first to share your story on WriteSpace!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-secondary-300 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-2">
              <span role="img" aria-hidden="true" className="text-2xl">
                ✍️
              </span>
              <span className="text-xl font-bold font-serif text-white">
                WriteSpace
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to={authenticated ? '/blogs' : '/login'}
                className="text-sm text-secondary-400 hover:text-white transition-colors"
              >
                Blogs
              </Link>
              {authenticated ? (
                <Link
                  to="/write"
                  className="text-sm text-secondary-400 hover:text-white transition-colors"
                >
                  Write
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-secondary-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm text-secondary-400 hover:text-white transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-secondary-700 text-center">
            <p className="text-sm text-secondary-500">
              © {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;