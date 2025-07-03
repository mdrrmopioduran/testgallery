import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Image as ImageIcon, Eye } from 'lucide-react';
import { User as UserType } from '../../types';

interface UserModalProps {
  user: UserType | null;
  onSave: (userData: Partial<UserType>) => void;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'photographer' | 'user',
    avatar: '',
    isActive: true
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'user',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
        isActive: true
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.avatar.trim()) {
      newErrors.avatar = 'Avatar URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const avatarOptions = [
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/1496372/pexels-photo-1496372.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=200',
    'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=200'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-900 flex items-center">
            <User className="h-6 w-6 mr-2" />
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <ImageIcon className="inline h-4 w-4 mr-1" />
              Profile Avatar
            </label>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={formData.avatar}
                alt="Selected avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-900"
              />
              <div className="flex-1">
                <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => handleInputChange('avatar', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent ${
                    errors.avatar ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter avatar URL"
                />
                {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>}
              </div>
            </div>
            
            {/* Avatar Options */}
            <div className="grid grid-cols-6 gap-2">
              {avatarOptions.map((avatarUrl, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleInputChange('avatar', avatarUrl)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                    formData.avatar === avatarUrl ? 'border-blue-900 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={avatarUrl}
                    alt={`Avatar option ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline h-4 w-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Shield className="inline h-4 w-4 mr-1" />
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="photographer">Photographer</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === 'admin' && 'Full access to all features and settings'}
                {formData.role === 'photographer' && 'Can upload and manage their own images'}
                {formData.role === 'user' && 'Can view and interact with public images'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Eye className="inline h-4 w-4 mr-1" />
                Account Status
              </label>
              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={formData.isActive}
                    onChange={() => handleInputChange('isActive', true)}
                    className="w-4 h-4 text-blue-900 focus:ring-blue-700"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={!formData.isActive}
                    onChange={() => handleInputChange('isActive', false)}
                    className="w-4 h-4 text-blue-900 focus:ring-blue-700"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactive</span>
                </label>
              </div>
            </div>
          </div>

          {/* User Stats (if editing) */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">User Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-900">{user.totalImages}</p>
                  <p className="text-xs text-gray-500">Total Images</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{user.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Views</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{new Date(user.joinDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Join Date</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{new Date(user.lastActive).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Last Active</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
            >
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;