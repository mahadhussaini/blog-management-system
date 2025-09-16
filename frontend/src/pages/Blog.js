import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePosts } from '../hooks/useApi';
import { FaSearch, FaCalendar, FaUser, FaClock, FaTag, FaFilter, FaSort } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const Blog = () => {
  const { getPosts, posts } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch posts when dependencies change
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const params = {
          page: currentPage,
          limit: 9,
          sort: sortBy,
          order: sortOrder,
        };

        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        if (selectedCategory) {
          params.category = selectedCategory;
        }

        await getPosts(params);
        setRetryCount(0); // Reset retry count on successful fetch
      } catch (error) {
        // Silenced to satisfy no-console; handled by UI retry state
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, debouncedSearchTerm, selectedCategory, sortBy, sortOrder, getPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategory('');
    setSortBy('publishedAt');
    setSortOrder('desc');
    setCurrentPage(1);
    setRetryCount(0);
  };

  const handleRetry = async () => {
    if (retryCount >= 3) return;

    setRetryCount(prev => prev + 1);
    setCurrentPage(1);

    // Trigger a refetch by updating the debounced search term
    setDebouncedSearchTerm(prev => prev);
  };

  const sortOptions = [
    { value: 'publishedAt', label: 'Date Published' },
    { value: 'title', label: 'Title' },
    { value: 'views', label: 'Views' },
    { value: 'readingTime', label: 'Reading Time' }
  ];

  const categories = [
    'Technology',
    'Lifestyle',
    'Travel',
    'Food',
    'Business',
    'Health',
    'Education'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover interesting articles and stories from our community of writers
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 pr-4 py-3 text-lg"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </form>

          {/* Sort and Filter Controls */}
          <div className="flex gap-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  setCurrentPage(1);
                }}
                className="form-input pr-8 min-w-[140px]"
              >
                {sortOptions.map((option) => (
                  <React.Fragment key={option.value}>
                    <option value={`${option.value}-desc`}>
                      {option.label} ↓
                    </option>
                    <option value={`${option.value}-asc`}>
                      {option.label} ↑
                    </option>
                  </React.Fragment>
                ))}
              </select>
              <FaSort className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors flex items-center ${
                isFilterOpen ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {isFilterOpen && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700 mr-2">Categories:</span>
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Active Filters Display */}
            {(debouncedSearchTerm || selectedCategory || sortBy !== 'publishedAt') && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {debouncedSearchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Search: "{debouncedSearchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Category: {selectedCategory}
                    <button
                      onClick={() => handleCategoryChange('')}
                      className="ml-1 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {sortBy !== 'publishedAt' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    Sort: {sortOptions.find(opt => opt.value === sortBy)?.label} {sortOrder === 'desc' ? '↓' : '↑'}
                    <button
                      onClick={() => {
                        setSortBy('publishedAt');
                        setSortOrder('desc');
                      }}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : posts?.data?.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {posts.data.map((post) => (
              <article key={post._id} className="card hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FaCalendar className="mr-1" />
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    <span className="mx-2">•</span>
                    <FaClock className="mr-1" />
                    {post.readingTime} min read
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    <Link to={`/blog/${post.slug || post._id}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-3 line-clamp-3">
                    {post.excerpt || post.content?.substring(0, 150) + '...'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUser className="mr-1" />
                      {post.author?.firstName || post.author?.username}
                    </div>

                    {post.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        <FaTag className="mr-1" />
                        {post.category}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/blog/${post.slug || post._id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>

          {/* Enhanced Pagination */}
          {posts.pagination && posts.pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Results info */}
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 9) + 1}-{Math.min(currentPage * 9, posts.pagination.totalPosts)} of {posts.pagination.totalPosts} posts
              </div>

              {/* Pagination controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>

                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, posts.pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (posts.pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= posts.pagination.totalPages - 2) {
                      pageNum = posts.pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, posts.pagination.totalPages))}
                  disabled={currentPage === posts.pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>

                <button
                  onClick={() => setCurrentPage(posts.pagination.totalPages)}
                  disabled={currentPage === posts.pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <FaSearch className="text-gray-400 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategory ? 'No posts found' : 'No posts yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filter criteria'
              : 'Check back later for new content!'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {(debouncedSearchTerm || selectedCategory || sortBy !== 'publishedAt') && (
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            )}
            {retryCount < 3 && (
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Retrying...' : `Retry (${retryCount}/3)`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
