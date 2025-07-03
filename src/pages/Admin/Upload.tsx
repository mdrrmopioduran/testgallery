import React, { useState } from 'react';
import { Upload as UploadIcon, Image as ImageIcon, Tag, FolderOpen, Droplets } from 'lucide-react';
import UploadZone from '../../components/Admin/UploadZone';
import { addImage } from '../../utils/storage';
import { Image as ImageType } from '../../types';
import { applyWatermark, getWatermarkSettings, isAutoApplyEnabled } from '../../utils/watermark';

const Upload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Nature',
    tags: '',
    isPublic: true,
    applyWatermark: isAutoApplyEnabled()
  });

  const handleFilesSelected = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach((file, index) => {
      const fileId = `${file.name}-${Date.now()}-${index}`;
      simulateUpload(fileId);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      alert('Please select at least one image to upload');
      return;
    }

    const watermarkSettings = getWatermarkSettings();
    const shouldApplyWatermark = formData.applyWatermark && watermarkSettings?.enabled;

    // Process each file
    for (let index = 0; index < uploadedFiles.length; index++) {
      const file = uploadedFiles[index];
      
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          let imageUrl = e.target?.result as string;
          
          // Apply watermark if enabled
          if (shouldApplyWatermark && watermarkSettings) {
            try {
              imageUrl = await applyWatermark(imageUrl, watermarkSettings);
            } catch (error) {
              console.error('Failed to apply watermark:', error);
              // Continue with original image if watermarking fails
            }
          }
          
          const newImage: ImageType = {
            id: `${Date.now()}-${index}`,
            title: formData.title || file.name,
            description: formData.description || 'Uploaded image',
            url: imageUrl,
            thumbnail: imageUrl,
            category: formData.category,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            uploadDate: new Date(),
            size: file.size,
            dimensions: { width: 1920, height: 1080 }, // Mock dimensions
            userId: '1',
            isPublic: formData.isPublic,
            likes: 0,
            views: 0
          };

          addImage(newImage);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Failed to process file:', error);
      }
    }

    // Reset form
    setUploadedFiles([]);
    setUploadProgress({});
    setFormData({
      title: '',
      description: '',
      category: 'Nature',
      tags: '',
      isPublic: true,
      applyWatermark: isAutoApplyEnabled()
    });

    alert(`Images uploaded successfully${shouldApplyWatermark ? ' with watermarks applied' : ''}!`);
  };

  const categories = ['Nature', 'Urban', 'Art', 'Objects', 'People', 'Architecture', 'Travel'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Upload Images</h1>
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
            
            {/* Upload Progress */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-medium text-blue-900">Upload Progress</h3>
                {uploadedFiles.map((file, index) => {
                  const fileId = `${file.name}-${Date.now()}-${index}`;
                  const progress = uploadProgress[fileId] || 0;
                  return (
                    <div key={fileId} className="flex items-center space-x-3">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-900">{file.name}</span>
                          <span className="text-gray-500">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-900 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                placeholder="Enter image title"
              />
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
                placeholder="Enter image description"
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
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
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

            <div className="space-y-3">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="applyWatermark"
                  checked={formData.applyWatermark}
                  onChange={(e) => setFormData(prev => ({ ...prev, applyWatermark: e.target.checked }))}
                  className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
                />
                <label htmlFor="applyWatermark" className="ml-2 text-sm text-gray-700 flex items-center">
                  <Droplets className="h-4 w-4 mr-1" />
                  Apply watermark
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadedFiles.length === 0}
              className="w-full px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Upload Images
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;