import React, { useEffect } from 'react';
import { X, Heart, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Image as ImageType } from '../../types';

interface LightboxProps {
  image: ImageType;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const Lightbox: React.FC<LightboxProps> = ({ 
  image, 
  onClose, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious 
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) onPrevious();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious, hasNext, hasPrevious]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-7xl max-h-full w-full h-full flex flex-col lg:flex-row">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Navigation buttons */}
        {hasPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Image */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={image.url}
            alt={image.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Image info */}
        <div className="lg:w-80 bg-white p-6 lg:overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{image.title}</h2>
          <p className="text-gray-600 mb-6">{image.description}</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors">
                  <Heart className="h-5 w-5" />
                  <span>{image.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors">
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>
                <button className="flex items-center space-x-2 text-green-500 hover:text-green-600 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium">{image.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Views:</span>
                <span className="ml-2 font-medium">{image.views}</span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-2 font-medium">{(image.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div>
                <span className="text-gray-500">Dimensions:</span>
                <span className="ml-2 font-medium">{image.dimensions.width}x{image.dimensions.height}</span>
              </div>
            </div>
            
            <div>
              <span className="text-gray-500 text-sm">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {image.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <span className="text-gray-500 text-sm">Uploaded:</span>
              <span className="ml-2 text-sm font-medium">
                {new Date(image.uploadDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;