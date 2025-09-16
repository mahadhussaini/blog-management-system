import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor';
import { usePosts } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { isValidObjectId } from '../utils/validators';
import { FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const EditPost = () => {
  const { id } = useParams();
  const { getPost, updatePost } = usePosts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    status: 'draft'
  });

  const [originalPost, setOriginalPost] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Validate ID format before making API call
        if (!isValidObjectId(id)) {
          toast.error('Invalid post ID format');
          navigate('/dashboard');
          return;
        }

        const response = await getPost(id);
        if (response && response.data) {
          const postData = response.data;
          
          // Check if post has an author and user permissions
          if (!postData.author) {
            toast.error('Post author information is missing');
            navigate('/dashboard');
            return;
          }

          // Check if user owns this post or is admin
          const isOwner = postData.author._id === user._id;
          const isAdmin = user.role === 'admin';

          if (!isOwner && !isAdmin) {
            toast.error('You do not have permission to edit this post');
            navigate('/dashboard');
            return;
          }

          setOriginalPost(postData);
          setFormData({
            title: postData.title || '',
            content: postData.content || '',
            excerpt: postData.excerpt || '',
            category: postData.category || '',
            tags: postData.tags || [],
            status: postData.status || 'draft'
          });
        } else {
          toast.error('Post not found');
          navigate('/dashboard');
        }
      } catch (error) {
        

        if (error.response?.status === 404) {
          toast.error('Post not found');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to edit this post');
        } else if (error.response?.status === 401) {
          toast.error('Please log in to edit posts');
        } else if (error.response?.status === 400) {
          toast.error('Invalid post ID. Please check the URL.');
        } else {
          toast.error('Failed to load post. Please try again.');
        }
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && user) {
      fetchPost();
    }
  }, [id, getPost, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
    if (errors.content) {
      setErrors(prev => ({
        ...prev,
        content: ''
      }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.excerpt && formData.excerpt.length > 300) {
      newErrors.excerpt = 'Excerpt cannot exceed 300 characters';
    }

    if (formData.category && formData.category.length > 50) {
      newErrors.category = 'Category cannot exceed 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        ...formData,
        status: publish ? 'published' : 'draft'
      };

      const result = await updatePost(id, postData);

      if (result) {
        toast.success(`Post ${publish ? 'published' : 'updated'} successfully!`);
        
        // If published, redirect to the post detail page
        if (publish && result.data) {
          // Use slug if available, otherwise use ID
          const postUrl = result.data.slug || result.data._id;
          navigate(`/blog/${postUrl}`);
        } else {
          // If draft, go to dashboard
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Technology', 'Lifestyle', 'Travel', 'Food', 'Business',
    'Health', 'Education', 'Entertainment', 'Sports', 'Science'
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-yellow-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please log in to edit posts.</p>
          <Link to="/login" className="btn-primary">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!originalPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-gray-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The post you're trying to edit doesn't exist or you don't have permission to edit it.</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isSubmitting}
              className="btn-secondary disabled:opacity-50"
            >
              {formData.status === 'published' ? 'Save Changes' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50"
            >
              Publish Post
            </button>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="form-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Enter your post title"
              maxLength={200}
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
            <p className="text-sm text-gray-500 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="form-label">
              Excerpt (Optional)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={formData.excerpt}
              onChange={handleInputChange}
              className={`form-input ${errors.excerpt ? 'border-red-500' : ''}`}
              placeholder="Brief summary of your post"
              maxLength={300}
            />
            {errors.excerpt && <p className="form-error">{errors.excerpt}</p>}
            <p className="text-sm text-gray-500 mt-1">
              {formData.excerpt.length}/300 characters
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="form-label">
              Content *
            </label>
            <div className={`${errors.content ? 'border-red-500' : ''}`}>
              <RichTextEditor
                ref={editorRef}
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Write your post content here..."
                className="min-h-[300px]"
              />
            </div>
            {errors.content && <p className="form-error">{errors.content}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="form-label">
              Category (Optional)
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`form-input ${errors.category ? 'border-red-500' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <p className="form-error">{errors.category}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="form-label">
              Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {formData.tags.length < 10 ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                  className="form-input flex-1"
                  placeholder="Add a tag"
                  maxLength={30}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-secondary px-4"
                >
                  Add
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Maximum 10 tags allowed</p>
            )}
          </div>

          {/* Post Information */}
          {originalPost && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Post Information</h3>
              <div className="text-sm text-gray-600">
                <p><strong>Author:</strong> {originalPost.author?.firstName || originalPost.author?.username || 'Unknown'}</p>
                <p><strong>Current Status:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    originalPost.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {originalPost.status || 'draft'}
                  </span>
                </p>
                <p><strong>Created:</strong> {originalPost.createdAt ? new Date(originalPost.createdAt).toLocaleDateString() : 'Unknown'}</p>
                <p><strong>Last Updated:</strong> {originalPost.updatedAt ? new Date(originalPost.updatedAt).toLocaleDateString() : 'Unknown'}</p>
                <p><strong>Views:</strong> {originalPost.views || 0}</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditPost;
