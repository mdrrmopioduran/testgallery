import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Upload,
  Settings,
  Wand2,
  Database,
  Droplets,
  Archive,
  Folder,
  FolderPlus
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Image, label: 'Images', path: '/admin/images' },
    { icon: Upload, label: 'Upload', path: '/admin/upload' },
    { icon: Wand2, label: 'Enhance', path: '/admin/enhance' },
    { icon: Droplets, label: 'Watermark', path: '/admin/watermark' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: FolderOpen, label: 'Categories', path: '/admin/categories' },
    { icon: Folder, label: 'Collections', path: '/admin/collections' },
    { icon: Archive, label: 'Archives', path: '/admin/archives' },
    { icon: Database, label: 'Database', path: '/admin/database' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-16">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-yellow-50 text-blue-900 border border-yellow-200'
                  : 'text-gray-700 hover:bg-yellow-50 hover:text-blue-900'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              to="/admin/collections/new"
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Collection</span>
            </Link>
            <Link
              to="/admin/archives/create"
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Archive className="h-4 w-4" />
              <span>Create Archive</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;