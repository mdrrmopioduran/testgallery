import React, { useState } from 'react';
import { Wand2, Sparkles, Palette, Zap } from 'lucide-react';
import ImageEnhancer from '../../components/Admin/ImageEnhancer';
import { getImages } from '../../utils/storage';
import { Image as ImageType } from '../../types';

const Enhance: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [images] = useState<ImageType[]>(getImages());

  const handleImageSelect = (image: ImageType) => {
    setSelectedImage(image);
  };

  const handleSaveEnhanced = (enhancedImageUrl: string) => {
    console.log('Enhanced image saved:', enhancedImageUrl);
    // In a real app, you would save this to your backend
    alert('Enhanced image saved successfully!');
  };

  const presetFilters = [
    { name: 'Vintage', icon: Palette, description: 'Warm, nostalgic tones' },
    { name: 'B&W', icon: Sparkles, description: 'Classic black and white' },
    { name: 'Vivid', icon: Zap, description: 'Enhanced colors and contrast' },
    { name: 'Soft', icon: Wand2, description: 'Gentle, dreamy effect' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-900">Image Enhancement</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Image Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Select Image</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleImageSelect(image)}
                  className={`w-full p-2 rounded-lg border transition-colors text-left ${
                    selectedImage?.id === image.id
                      ? 'border-blue-900 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={image.thumbnail}
                      alt={image.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 truncate">
                        {image.title}
                      </p>
                      <p className="text-xs text-gray-500">{image.category}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Presets</h3>
            <div className="space-y-2">
              {presetFilters.map((preset) => (
                <button
                  key={preset.name}
                  className="w-full p-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <preset.icon className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">{preset.name}</p>
                      <p className="text-xs text-gray-500">{preset.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhancement Tools */}
        <div className="lg:col-span-3">
          {selectedImage ? (
            <ImageEnhancer
              imageUrl={selectedImage.url}
              onSave={handleSaveEnhanced}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Wand2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Select an Image to Enhance
              </h3>
              <p className="text-gray-500">
                Choose an image from the list to start applying enhancements and filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Enhance;