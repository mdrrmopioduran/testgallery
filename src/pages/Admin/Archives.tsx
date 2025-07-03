import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Trash2,
  Calendar,
  HardDrive,
  FileArchive,
  Clock,
  User,
  FolderArchive,
  Package,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface ArchiveItem {
  id: string;
  name: string;
  description: string;
  type: 'full_backup' | 'images_only' | 'users_only' | 'custom';
  size: number;
  itemCount: number;
  createdBy: string;
  createdAt: Date;
  status: 'creating' | 'completed' | 'failed';
  downloadUrl?: string;
  metadata: {
    imageCount?: number;
    userCount?: number;
    categoryCount?: number;
    settingsIncluded?: boolean;
  };
}

const Archives: React.FC = () => {
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [filteredArchives, setFilteredArchives] = useState<ArchiveItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadArchives();
  }, []);

  useEffect(() => {
    filterArchives();
  }, [archives, searchTerm, selectedType]);

  const loadArchives = () => {
    const saved = localStorage.getItem('gallery_archives');
    if (saved) {
      setArchives(JSON.parse(saved));
    } else {
      // Initialize with sample archives
      const sampleArchives: ArchiveItem[] = [
        {
          id: '1',
          name: 'Full Gallery Backup - January 2024',
          description: 'Complete backup including all images, users, and settings',
          type: 'full_backup',
          size: 2048000000, // 2GB
          itemCount: 1250,
          createdBy: 'John Doe',
          createdAt: new Date('2024-01-20'),
          status: 'completed',
          downloadUrl: '#',
          metadata: {
            imageCount: 1250,
            userCount: 48,
            categoryCount: 12,
            settingsIncluded: true
          }
        },
        {
          id: '2',
          name: 'Images Archive - December 2023',
          description: 'Archive of all images from December 2023',
          type: 'images_only',
          size: 1536000000, // 1.5GB
          itemCount: 890,
          createdBy: 'Jane Smith',
          createdAt: new Date('2024-01-01'),
          status: 'completed',
          downloadUrl: '#',
          metadata: {
            imageCount: 890,
            settingsIncluded: false
          }
        },
        {
          id: '3',
          name: 'Weekly Backup - Current',
          description: 'Automated weekly backup in progress',
          type: 'full_backup',
          size: 0,
          itemCount: 0,
          createdBy: 'System',
          createdAt: new Date(),
          status: 'creating',
          metadata: {
            settingsIncluded: true
          }
        }
      ];
      setArchives(sampleArchives);
      localStorage.setItem('gallery_archives', JSON.stringify(sampleArchives));
    }
  };

  const filterArchives = () => {
    let filtered = [...archives];

    if (searchTerm) {
      filtered = filtered.filter(archive =>
        archive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        archive.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(archive => archive.type === selectedType);
    }

    setFilteredArchives(filtered);
  };

  const handleCreateArchive = async (archiveData: Partial<ArchiveItem>) => {
    setIsCreating(true);
    
    const newArchive: ArchiveItem = {
      id: Date.now().toString(),
      name: archiveData.name || 'New Archive',
      description: archiveData.description || '',
      type: archiveData.type || 'custom',
      size: 0,
      itemCount: 0,
      createdBy: 'Current User',
      createdAt: new Date(),
      status: 'creating',
      metadata: archiveData.metadata || {},
      ...archiveData
    };

    const updated = [...archives, newArchive];
    setArchives(updated);
    localStorage.setItem('gallery_archives', JSON.stringify(updated));

    // Simulate archive creation
    setTimeout(() => {
      const completedArchive = {
        ...newArchive,
        status: 'completed' as const,
        size: Math.floor(Math.random() * 1000000000) + 500000000, // Random size
        itemCount: Math.floor(Math.random() * 1000) + 100,
        downloadUrl: '#'
      };

      const finalUpdated = updated.map(a => 
        a.id === newArchive.id ? completedArchive : a
      );
      setArchives(finalUpdated);
      localStorage.setItem('gallery_archives', JSON.stringify(finalUpdated));
      setIsCreating(false);
    }, 3000);

    setShowCreateModal(false);
  };

  const handleDeleteArchive = (id: string) => {
    if (window.confirm('Are you sure you want to delete this archive?')) {
      const updated = archives.filter(a => a.id !== id);
      setArchives(updated);
      localStorage.setItem('gallery_archives', JSON.stringify(updated));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full_backup': return Package;
      case 'images_only': return FileArchive;
      case 'users_only': return User;
      default: return Archive;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full_backup': return 'Full Backup';
      case 'images_only': return 'Images Only';
      case 'users_only': return 'Users Only';
      default: return 'Custom';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'creating': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stats = {
    total: archives.length,
    completed: archives.filter(a => a.status === 'completed').length,
    totalSize: archives.reduce((sum, a) => sum + a.size, 0),
    inProgress: archives.filter(a => a.status === 'creating').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Archives</h1>
          <p className="text-gray-600 mt-1">Manage backups and archived data</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isCreating}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium disabled:opacity-50"
        >
          <FolderArchive className="h-4 w-4" />
          <span>Create Archive</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Archives</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Archive className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-purple-600">{formatFileSize(stats.totalSize)}</p>
            </div>
            <HardDrive className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search archives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="full_backup">Full Backup</option>
            <option value="images_only">Images Only</option>
            <option value="users_only">Users Only</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Archives List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Archive
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArchives.map((archive) => {
                const TypeIcon = getTypeIcon(archive.type);
                return (
                  <tr key={archive.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TypeIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-blue-900">{archive.name}</div>
                          <div className="text-sm text-gray-500">{archive.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getTypeLabel(archive.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {archive.size > 0 ? formatFileSize(archive.size) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {archive.itemCount > 0 ? archive.itemCount.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(archive.status)}`}>
                          {archive.status === 'creating' && <RefreshCw className="inline h-3 w-3 mr-1 animate-spin" />}
                          {archive.status === 'completed' && <CheckCircle className="inline h-3 w-3 mr-1" />}
                          {archive.status === 'failed' && <AlertCircle className="inline h-3 w-3 mr-1" />}
                          {archive.status.charAt(0).toUpperCase() + archive.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{new Date(archive.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">by {archive.createdBy}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {archive.status === 'completed' && (
                          <button className="text-blue-900 hover:text-blue-700">
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteArchive(archive.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredArchives.length === 0 && (
        <div className="text-center py-12">
          <Archive className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No archives found</h3>
          <p className="text-gray-500 mb-4">Create your first archive to backup your data.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium mx-auto"
          >
            <FolderArchive className="h-4 w-4" />
            <span>Create Archive</span>
          </button>
        </div>
      )}

      {/* Create Archive Modal */}
      {showCreateModal && (
        <CreateArchiveModal
          onSave={handleCreateArchive}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

const CreateArchiveModal: React.FC<{
  onSave: (data: Partial<ArchiveItem>) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'full_backup' as ArchiveItem['type'],
    includeImages: true,
    includeUsers: true,
    includeSettings: true,
    includeCategories: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description,
      type: formData.type,
      metadata: {
        settingsIncluded: formData.includeSettings,
        imageCount: formData.includeImages ? 1250 : 0,
        userCount: formData.includeUsers ? 48 : 0,
        categoryCount: formData.includeCategories ? 12 : 0
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-900">Create Archive</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archive Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="Enter archive name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archive Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ArchiveItem['type'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            >
              <option value="full_backup">Full Backup</option>
              <option value="images_only">Images Only</option>
              <option value="users_only">Users Only</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {formData.type === 'custom' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Include in Archive:
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeImages}
                    onChange={(e) => setFormData(prev => ({ ...prev, includeImages: e.target.checked }))}
                    className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
                  />
                  <span className="ml-2 text-sm text-gray-700">Images</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeUsers}
                    onChange={(e) => setFormData(prev => ({ ...prev, includeUsers: e.target.checked }))}
                    className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
                  />
                  <span className="ml-2 text-sm text-gray-700">Users</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeCategories}
                    onChange={(e) => setFormData(prev => ({ ...prev, includeCategories: e.target.checked }))}
                    className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
                  />
                  <span className="ml-2 text-sm text-gray-700">Categories</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeSettings}
                    onChange={(e) => setFormData(prev => ({ ...prev, includeSettings: e.target.checked }))}
                    className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
                  />
                  <span className="ml-2 text-sm text-gray-700">Settings</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
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
              Create Archive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Archives;