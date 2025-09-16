import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePosts } from '../hooks/useApi';
import { FaCalendar, FaUser, FaClock, FaTag, FaHeart, FaRegHeart, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getPost, loading, likePost } = usePosts();
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setError(null);
        setNotFound(false);

        // Basic validation for identifier (can be slug or ID)
        if (!slug || slug.trim() === '') {
          setError('Invalid post identifier provided');
          return;
        }

        const result = await getPost(slug);

        if (result && result.success && result.data) {
          setPost(result.data);
          setLikesCount(result.data.likes?.length || 0);
          // Check if current user liked this post (would need user context)
          // setLiked(result.data.likes?.some(like => like.user === currentUserId));
        } else {
          setNotFound(true);
        }
      } catch (error) {

        // Handle different types of errors
        if (error.response?.status === 404) {
          setNotFound(true);
        } else if (error.response?.status === 400) {
          setError('Invalid post identifier');
        } else if (error.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else if (!navigator.onLine) {
          setError('No internet connection. Please check your network.');
        } else {
          setError('Failed to load post. Please try again.');
        }
      }
    };

    if (slug) {
      fetchPost();
    } else {
      setError('No post identifier provided');
    }
  }, [slug, getPost]);

  const handleLike = async () => {
    if (!post) return;

    try {
      const result = await likePost(post._id);
      if (result) {
        setLiked(result.isLiked);
        setLikesCount(result.likesCount);
      }
    } catch (error) {
    }
  };

  const handleGoBack = () => {
    navigate('/blog');
  };

  // Show loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show not found state
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-yellow-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">
            The post you're looking for doesn't exist or may have been moved.
          </p>
          <div className="space-y-4">
            <button
              onClick={handleGoBack}
              className="btn-primary w-full flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Blog
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-red-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="space-y-4">
            <button
              onClick={handleGoBack}
              className="btn-primary w-full flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Blog
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show no post state (shouldn't happen, but safety check)
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationTriangle className="text-gray-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Post Not Available</h1>
          <p className="text-gray-600 mb-8">
            Unable to load the requested post at this time.
          </p>
          <button
            onClick={handleGoBack}
            className="btn-primary flex items-center justify-center mx-auto"
          >
            <FaArrowLeft className="mr-2" />
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={handleGoBack}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Blog
        </button>
      </div>

      {/* Post Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-4">
          <div className="flex items-center">
            <FaUser className="mr-1" />
            {post.author?.firstName || post.author?.username}
          </div>

          <div className="flex items-center">
            <FaCalendar className="mr-1" />
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
          </div>

          <div className="flex items-center">
            <FaClock className="mr-1" />
            {post.readingTime} min read
          </div>

          {post.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              <FaTag className="mr-1" />
              {post.category}
            </span>
          )}
        </div>

        {post.excerpt && (
          <p className="text-lg text-gray-600 italic">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Post Content */}
      <article className="card mb-8">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Post Footer */}
      <footer className="border-t border-gray-200 pt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                liked
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              {liked ? <FaHeart /> : <FaRegHeart />}
              <span>{likesCount}</span>
            </button>
          </div>

          <div className="text-sm text-gray-500">
            {post.views} views
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio */}
        {post.author && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {post.author.firstName?.charAt(0) || post.author.username?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {post.author.firstName || post.author.username}
                </h3>
                {post.author.bio && (
                  <p className="text-gray-600">{post.author.bio}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default PostDetail;
