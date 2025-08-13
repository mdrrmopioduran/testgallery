import React, { useState } from 'react';
import { Upload as UploadIcon, Image as ImageIcon, Tag, FolderOpen, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import UploadZone from '../../components/Admin/UploadZone';
import apiClient from '../../utils/api';

const Upload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploadResults, setUploadResults] = useState<{ success: boolean; message: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Nature',
    tags: '',
    isPublic: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleFilesSelected = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploadResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      alert('Please select at least one image to upload');
      return;
    }

    setUploading(true);
    const results: { success: boolean; message: string }[] = [];

    // Process each file
    for (let index = 0; index < uploadedFiles.length; index++) {
      const file = uploadedFiles[index];
      
      try {
        const response = await apiClient.uploadImage(file, {
          title: formData.title || file.name.split('.')[0],
          description: formData.description || `Uploaded image: ${file.name}`,
          category_id: formData.category === 'Nature' ? await getCategoryId('Nature') : undefined,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
          is_public: formData.isPublic
        });
        
        if (response.data) {
          results.push({ success: true, message: `${file.name} uploaded successfully` });
        } else {
          results.push({ success: false, message: `${file.name}: ${response.error}` });
        }
      } catch (error) {
        results.push({ success: false, message: `${file.name}: Upload failed` });
      }
    }

    setUploadResults(results);
    setUploading(false);

    // Reset form if all uploads successful
    if (results.every(r => r.success)) {
      setUploadedFiles([]);
      setFormData({
        title: '',
        description: '',
        category: 'Nature',
        tags: '',
        isPublic: true
      });
    }
  };

  const getCategoryId = async (categoryName: string): Promise<string | undefined> => {
    try {
      const response = await apiClient.getCategories();
      if (response.data) {
        const category = response.data.find((cat: any) => cat.name === categoryName);
        return category?.id;
      }
    } catch (error) {
      console.error('Failed to get category ID:', error);
    }
    return undefined;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Upload Images</h1>
          <p className="text-gray-600 mt-1">Upload and manage your image collection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <UploadIcon className="h-5 w-5 mr-2" />
              Upload Files
            </h2>
            <UploadZone onFilesSelected={handleFilesSelected} />
            
            {/* Upload Results */}
            {uploadResults.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="font-medium text-blue-900">Upload Results</h3>
                {uploadResults.map((result, index) => (
                  <div key={index} className={`flex items-center space-x-2 p-2 rounded ${
                    result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {result.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm">{result.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* File List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-medium text-blue-900">Selected Files</h3>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-900">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Image Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="Enter image title (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use filename</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="Enter image description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FolderOpen className="inline h-4 w-4 mr-1" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                disabled={loadingCategories}
              >
                {loadingCategories ? (
                  <option>Loading categories...</option>
                ) : (
                  categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Tag className="inline h-4 w-4 mr-1" />
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
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
                Make images public
              </label>
            </div>

            <button
              type="submit"
              disabled={uploadedFiles.length === 0 || uploading}
              className="w-full px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? 'Uploading...' : `Upload ${uploadedFiles.length} Image${uploadedFiles.length !== 1 ? 's' : ''}`}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Upload;