import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Grid,
  List,
  Image as ImageIcon,
  Calendar,
  User,
  Share2,
  Download,
  FolderPlus,
  X,
  Save
} from 'lucide-react';
import { getImages } from '../../utils/storage';
import { Image as ImageType } from '../../types';

interface Collection {
  id: string;
  name: string;
  description: string;
  imageIds: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  coverImage?: string;
  tags: string[];
}

interface CollectionModalProps {
  collection: Collection | null;
  onSave: (collectionData: Partial<Collection>) => void;
  onClose: () => void;
  availableImages: ImageType[];
}

const CollectionModal: React.FC<CollectionModalProps> = ({ 
  collection, 
  onSave, 
  onClose, 
  availableImages 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    tags: '',
    selectedImageIds: [] as string[]
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name,
        description: collection.description,
        isPublic: collection.isPublic,
        tags: collection.tags.join(', '),
        selectedImageIds: collection.imageIds
      });
    }
  }, [collection]);

  const filteredImages = availableImages.filter(img =>
    img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageToggle = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedImageIds: prev.selectedImageIds.includes(imageId)
        ? prev.selectedImageIds.filter(id => id !== imageId)
        : [...prev.selectedImageIds, imageId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description,
      isPublic: formData.isPublic,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      imageIds: formData.selectedImageIds,
      coverImage: formData.selectedImageIds.length > 0 
        ? availableImages.find(img => img.id === formData.selectedImageIds[0])?.thumbnail
        : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-900 flex items-center">
            <Folder className="h-6 w-6 mr-2" />
            {collection ? 'Edit Collection' : 'Create New Collection'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collection Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Collection Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="Enter collection name"
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
                  placeholder="Enter collection description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                  Make collection public
                </label>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Selected Images</h4>
                <p className="text-sm text-gray-600">
                  {formData.selectedImageIds.length} images selected
                </p>
              </div>
            </div>

            {/* Image Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Select Images</h3>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      formData.selectedImageIds.includes(image.id)
                        ? 'border-blue-900 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleImageToggle(image.id)}
                  >
                    <img
                      src={image.thumbnail}
                      alt={image.title}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                      {formData.selectedImageIds.includes(image.id) && (
                        <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                      <p className="text-xs truncate">{image.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
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
              {collection ? 'Update Collection' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Collections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [images] = useState<ImageType[]>(getImages());
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    filterCollections();
  }, [collections, searchTerm, selectedStatus]);

  const loadCollections = () => {
    const saved = localStorage.getItem('gallery_collections');
    if (saved) {
      setCollections(JSON.parse(saved));
    } else {
      // Initialize with sample collections
      const sampleCollections: Collection[] = [
        {
          id: '1',
          name: 'Nature Photography',
          description: 'Beautiful landscapes and nature scenes',
          imageIds: images.filter(img => img.category === 'Nature').map(img => img.id),
          createdBy: 'John Doe',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          isPublic: true,
          coverImage: images.find(img => img.category === 'Nature')?.thumbnail,
          tags: ['nature', 'landscape', 'outdoor']
        },
        {
          id: '2',
          name: 'Urban Exploration',
          description: 'City life and urban architecture',
          imageIds: images.filter(img => img.category === 'Urban').map(img => img.id),
          createdBy: 'Jane Smith',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
          isPublic: true,
          coverImage: images.find(img => img.category === 'Urban')?.thumbnail,
          tags: ['urban', 'city', 'architecture']
        }
      ];
      setCollections(sampleCollections);
      localStorage.setItem('gallery_collections', JSON.stringify(sampleCollections));
    }
  };

  const filterCollections = () => {
    let filtered = [...collections];

    if (searchTerm) {
      filtered = filtered.filter(collection =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(collection => 
        selectedStatus === 'public' ? collection.isPublic : !collection.isPublic
      );
    }

    setFilteredCollections(filtered);
  };

  const handleCreateCollection = () => {
    setEditingCollection(null);
    setShowModal(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setShowModal(true);
  };

  const handleDeleteCollection = (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      const updated = collections.filter(c => c.id !== id);
      setCollections(updated);
      localStorage.setItem('gallery_collections', JSON.stringify(updated));
    }
  };

  const handleSaveCollection = (collectionData: Partial<Collection>) => {
    if (editingCollection) {
      const updated = collections.map(c =>
        c.id === editingCollection.id 
          ? { ...c, ...collectionData, updatedAt: new Date() }
          : c
      );
      setCollections(updated);
      localStorage.setItem('gallery_collections', JSON.stringify(updated));
    } else {
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: collectionData.name || '',
        description: collectionData.description || '',
        imageIds: collectionData.imageIds || [],
        createdBy: 'Current User',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: collectionData.isPublic || false,
        coverImage: collectionData.coverImage,
        tags: collectionData.tags || [],
        ...collectionData
      };
      const updated = [...collections, newCollection];
      setCollections(updated);
      localStorage.setItem('gallery_collections', JSON.stringify(updated));
    }
    setShowModal(false);
  };

  const stats = {
    total: collections.length,
    public: collections.filter(c => c.isPublic).length,
    totalImages: collections.reduce((sum, c) => sum + c.imageIds.length, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Collections</h1>
          <p className="text-gray-600 mt-1">Organize images into curated collections</p>
        </div>
        <button
          onClick={handleCreateCollection}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
        >
          <FolderPlus className="h-4 w-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collections</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Folder className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Public Collections</p>
              <p className="text-2xl font-bold text-green-600">{stats.public}</p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Images</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalImages}</p>
            </div>
            <ImageIcon className="h-8 w-8 text-purple-600" />
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
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCollections.map((collection) => (
          <div key={collection.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="relative">
              {collection.coverImage ? (
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                  <Folder className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  collection.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {collection.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                {collection.imageIds.length} images
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">{collection.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{collection.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {collection.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{collection.createdBy}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(collection.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCollection(collection)}
                    className="p-2 text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
          <p className="text-gray-500 mb-4">Create your first collection to organize your images.</p>
          <button
            onClick={handleCreateCollection}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium mx-auto"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Create Collection</span>
          </button>
        </div>
      )}

      {/* Collection Modal */}
      {showModal && (
        <CollectionModal
          collection={editingCollection}
          onSave={handleSaveCollection}
          onClose={() => setShowModal(false)}
          availableImages={images}
        />
      )}
    </div>
  );
};

export default Collections;