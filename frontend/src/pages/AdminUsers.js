import React, { useState, useEffect, useCallback } from 'react';
import { useUsers } from '../hooks/useApi';
import {
  FaUsers,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUserPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaCrown,
  FaPenNib
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { getUsers, updateUser, deleteUser } = useUsers();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    isActive: true
  });

  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: usersPerPage
      };

      if (searchTerm) {
        // Note: This would require backend search functionality
        // For now, we'll filter on the frontend
      }

      if (roleFilter) {
        // This would also require backend filtering
      }

      const response = await getUsers(params);
      if (response) {
        setUsers(response.data || []);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [getUsers, currentPage, roleFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, searchTerm, roleFilter, statusFilter]);

  const handleEditUser = (user) => {
    setEditingUser(user._id);
    setEditForm({
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      isActive: user.isActive
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: '',
      isActive: true
    });
  };

  const handleSaveEdit = async () => {
    try {
      const result = await updateUser(editingUser, editForm);
      if (result) {
        toast.success('User updated successfully!');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        const result = await deleteUser(userId);
        if (result) {
          toast.success('User deleted successfully!');
          fetchUsers();
        }
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const result = await updateUser(userId, { isActive: !currentStatus });
      if (result) {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? user.isActive : !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Total Users: {users.length}
            </div>
            <button className="btn-primary">
              <FaUserPlus className="inline mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input w-40"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="author">Author</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input w-40"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || roleFilter || statusFilter) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {roleFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Role: {roleFilter}
                  <button
                    onClick={() => setRoleFilter('')}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter('')}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        {loading ? (
          <LoadingSpinner />
        ) : paginatedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user._id}>
                    {editingUser === user._id ? (
                      // Edit Mode
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.username}
                              onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                              className="form-input text-sm"
                              placeholder="Username"
                            />
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                              className="form-input text-sm"
                              placeholder="Email"
                            />
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={editForm.firstName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                className="form-input text-sm flex-1"
                                placeholder="First Name"
                              />
                              <input
                                type="text"
                                value={editForm.lastName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                className="form-input text-sm flex-1"
                                placeholder="Last Name"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                            className="form-input text-sm"
                          >
                            <option value="author">Author</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                              className="mr-2"
                            />
                            Active
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <FaTimesCircle />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName && user.lastName
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.username
                                }
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-400">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? (
                              <><FaCrown className="mr-1" /> Admin</>
                            ) : (
                              <><FaPenNib className="mr-1" /> Author</>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isActive ? (
                              <><FaCheckCircle className="mr-1" /> Active</>
                            ) : (
                              <><FaTimesCircle className="mr-1" /> Inactive</>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit user"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                              className={`hover:text-gray-900 ${
                                user.isActive ? 'text-yellow-600' : 'text-green-600'
                              }`}
                              title={user.isActive ? 'Deactivate user' : 'Activate user'}
                            >
                              {user.isActive ? <FaTimesCircle /> : <FaCheckCircle />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id, user.username)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete user"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaUsers className="text-gray-400 text-4xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || roleFilter || statusFilter ? 'No users found' : 'No users yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || roleFilter || statusFilter
                ? 'Try adjusting your search or filter criteria'
                : 'Users will appear here once they register'}
            </p>
            {(searchTerm || roleFilter || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
