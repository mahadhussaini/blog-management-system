import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts, useUsers } from '../hooks/useApi';
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaUsers,
  FaBlog,
  FaDraft2Digital,
  FaCheckCircle,
  FaClock,
  FaTrash
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserPosts, deletePost, posts, loading: postsLoading } = usePosts();
  const { getUserStats, users: userStats, loading: statsLoading } = useUsers();

  const [activeTab, setActiveTab] = useState('posts');

  const fetchUserPosts = useCallback(async () => {
    try {
      // Use the user's posts endpoint
      await getUserPosts({ limit: 10 });
    } catch (error) {
      
    }
  }, [getUserPosts]);

  useEffect(() => {
    if (user?.role === 'admin') {
      getUserStats();
    }
    fetchUserPosts();
  }, [user, getUserStats, fetchUserPosts]);

  const isAdmin = user?.role === 'admin';
  const isAuthor = user?.role === 'author' || user?.role === 'admin';

  const handleDeletePost = async (postId, postTitle) => {
    if (window.confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      try {
        await deletePost(postId);
        toast.success('Post deleted successfully!');
        // Refresh the posts list
        fetchUserPosts();
      } catch (error) {
        toast.error('Failed to delete post. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || user?.username}!
        </h1>
        <p className="text-gray-600">
          {isAdmin ? 'Manage your blog and users' : 'Manage your blog posts'}
        </p>
      </div>

      {/* Admin Stats Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsLoading ? '...' : userStats?.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaBlog className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published Posts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsLoading ? '...' : userStats?.publishedPosts || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaDraft2Digital className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft Posts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsLoading ? '...' : (userStats?.totalPosts || 0) - (userStats?.publishedPosts || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaCheckCircle className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Authors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {statsLoading ? '...' : userStats?.authorUsers || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {isAuthor && (
            <Link
              to="/create-post"
              className="btn-primary inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              Create New Post
            </Link>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin/users"
                className="btn-secondary inline-flex items-center"
              >
                <FaUsers className="mr-2" />
                Manage Users
              </Link>
              <Link
                to="/blog"
                className="btn-secondary inline-flex items-center"
              >
                <FaEye className="mr-2" />
                View Public Blog
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Posts
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('recent')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Activity
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Posts</h2>
            {isAuthor && (
              <Link to="/create-post" className="btn-primary">
                <FaPlus className="mr-2" />
                New Post
              </Link>
            )}
          </div>

          {postsLoading ? (
            <LoadingSpinner />
          ) : posts?.data?.length > 0 ? (
            <div className="space-y-4">
              {posts.data.map((post) => {
                // Check if post has author information
                if (!post.author) return null;
                
                return (
                <div key={post._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <FaClock className="mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? (
                          <><FaCheckCircle className="mr-1" /> Published</>
                        ) : (
                          <><FaDraft2Digital className="mr-1" /> Draft</>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {post.status === 'published' && (
                      <Link
                        to={`/blog/${post.slug || post._id}`}
                        className="text-gray-600 hover:text-gray-900 p-2"
                        title="View post"
                      >
                        <FaEye />
                      </Link>
                    )}
                    <Link
                      to={`/edit-post/${post._id}`}
                      className="text-blue-600 hover:text-blue-900 p-2"
                      title="Edit post"
                    >
                      <FaEdit />
                    </Link>
                    <button
                      className="text-red-600 hover:text-red-900 p-2"
                      title="Delete post"
                      onClick={() => handleDeletePost(post._id, post.title)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaBlog className="text-gray-400 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first blog post to get started!
              </p>
              {isAuthor && (
                <Link to="/create-post" className="btn-primary">
                  Create Your First Post
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recent' && isAdmin && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>

          {statsLoading ? (
            <LoadingSpinner />
          ) : userStats?.recentUsers?.length > 0 ? (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Users</h3>
                {userStats.recentUsers.map((recentUser) => (
                  <div key={recentUser._id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {recentUser.firstName?.charAt(0) || recentUser.username?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {recentUser.firstName || recentUser.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(recentUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      recentUser.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {recentUser.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaUsers className="text-gray-400 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No recent activity
              </h3>
              <p className="text-gray-600">
                Activity will appear here as users join and create content.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
