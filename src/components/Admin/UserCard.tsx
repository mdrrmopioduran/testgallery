import React from 'react';
import { Edit, Trash2, Eye, EyeOff, Mail, Calendar, Camera, Activity } from 'lucide-react';
import { User } from '../../types';

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'photographer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      isSelected ? 'border-blue-900 bg-blue-50' : 'border-gray-200'
    }`}>
      {/* Header with checkbox and status */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
          />
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.isActive)}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-blue-900 truncate">{user.name}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <Camera className="h-4 w-4" />
              <span className="text-xs">Images</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{user.totalImages}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs">Views</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{user.totalViews.toLocaleString()}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2 text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <span>Joined: {new Date(user.joinDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-3 w-3" />
            <span>Last active: {new Date(user.lastActive).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={onToggleStatus}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
              user.isActive 
                ? 'text-red-600 hover:bg-red-50' 
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit user"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete user"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;