import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaCog, FaBlog, FaHome, FaPlus } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FaBlog className="text-blue-600 text-2xl" />
              <span className="font-bold text-xl text-gray-800">BlogManager</span>
            </Link>

            <div className="hidden md:flex items-center space-x-4 ml-10">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <FaHome className="inline mr-1" />
                Home
              </Link>
              <Link
                to="/blog"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <FaBlog className="inline mr-1" />
                Blog
              </Link>
            </div>
          </div>

          {/* Right side navigation */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative">
                {/* User menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium focus:outline-none"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:block">{user?.firstName || user?.username}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      Signed in as <br />
                      <span className="font-medium text-gray-900">{user?.username}</span>
                      {user?.role === 'admin' && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          Admin
                        </span>
                      )}
                    </div>

                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaBlog className="inline mr-2" />
                      Dashboard
                    </Link>

                    {(user?.role === 'author' || user?.role === 'admin') && (
                      <Link
                        to="/create-post"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaPlus className="inline mr-2" />
                        Create Post
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUser className="inline mr-2" />
                      Profile
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/users"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaCog className="inline mr-2" />
                        Manage Users
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaHome className="inline mr-2" />
                Home
              </Link>
              <Link
                to="/blog"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaBlog className="inline mr-2" />
                Blog
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaBlog className="inline mr-2" />
                    Dashboard
                  </Link>

                  {(user?.role === 'author' || user?.role === 'admin') && (
                    <Link
                      to="/create-post"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaPlus className="inline mr-2" />
                      Create Post
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser className="inline mr-2" />
                    Profile
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/users"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaCog className="inline mr-2" />
                      Manage Users
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    <FaSignOutAlt className="inline mr-2" />
                    Sign Out
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 bg-blue-600 text-white rounded-md mt-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
