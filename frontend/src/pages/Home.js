import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../hooks/useApi';
import { FaArrowRight, FaBlog, FaUsers, FaPenNib } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { getPosts, posts, loading } = usePosts();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Only fetch if we haven't fetched before to prevent duplicate requests
    if (!hasFetched) {
      const fetchFeaturedPosts = async () => {
        try {
          await getPosts({ limit: 3 });
          setHasFetched(true);
        } catch (error) { }
      };

      fetchFeaturedPosts();
    }
  }, [getPosts, hasFetched]);

  useEffect(() => {
    if (posts?.data) {
      setFeaturedPosts(posts.data.slice(0, 3));
    }
  }, [posts]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to BlogManager
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              A powerful blog management system built with the MERN stack.
              Create, manage, and publish your content with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/blog"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Explore Blog <FaArrowRight className="inline ml-2" />
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your blog content effectively
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPenNib className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Content Creation
              </h3>
              <p className="text-gray-600">
                Create and edit posts with our intuitive editor. Support for rich text formatting and media uploads.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                User Management
              </h3>
              <p className="text-gray-600">
                Role-based access control with separate permissions for admins, authors, and regular users.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBlog className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Blog Management
              </h3>
              <p className="text-gray-600">
                Organize your content with categories, tags, and search functionality. Publish or save as drafts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Latest Posts
            </h2>
            <p className="text-lg text-gray-600">
              Check out our most recent blog posts
            </p>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : featuredPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <div key={post._id} className="card hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      <Link
                        to={`/blog/${post.slug || post._id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      By {post.author?.firstName || post.author?.username} on{' '}
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 line-clamp-3">
                      {post.excerpt || post.content?.substring(0, 150) + '...'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/blog/${post.slug || post._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read more →
                    </Link>
                    <div className="text-sm text-gray-500">
                      {post.readingTime} min read
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaBlog className="text-gray-400 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600">
                Check back later for new content!
              </p>
            </div>
          )}

          {featuredPosts.length > 0 && (
            <div className="text-center mt-8">
              <Link
                to="/blog"
                className="btn-primary inline-flex items-center"
              >
                View All Posts <FaArrowRight className="ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Blogging?
          </h2>
          <p className="text-xl mb-8">
            Join our community of writers and share your stories with the world.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
