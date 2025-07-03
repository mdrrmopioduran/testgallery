import React from 'react';
import { Heart, Eye, Calendar } from 'lucide-react';
import { Image as ImageType } from '../../types';

interface ImageCardProps {
  image: ImageType;
  onClick: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        <img
          src={image.thumbnail}
          alt={image.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Eye className="h-8 w-8" />
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
            {image.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{image.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{image.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{image.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{image.views}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(image.uploadDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {image.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;