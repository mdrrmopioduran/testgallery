import React, { useState, useEffect } from 'react';
import { Image as ImageType } from '../types';
import { getImages } from '../utils/storage';
import ImageCard from '../components/Gallery/ImageCard';
import Lightbox from '../components/Gallery/Lightbox';
import FilterBar from '../components/Gallery/FilterBar';

const Gallery: React.FC = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageType[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadImages = () => {
      const allImages = getImages().filter(img => img.isPublic);
      setImages(allImages);
      setFilteredImages(allImages);
    };
    loadImages();
  }, []);

  useEffect(() => {
    let filtered = images;

    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }

    setFilteredImages(filtered);
  }, [images, searchTerm, selectedCategory]);

  const categories = Array.from(new Set(images.map(img => img.category)));

  const handleImageClick = (image: ImageType) => {
    setSelectedImage(image);
  };

  const handleNext = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const handlePrevious = () => {
    if (!selectedImage) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : filteredImages.length - 1;
    setSelectedImage(filteredImages[previousIndex]);
  };

  const hasNext = selectedImage ? filteredImages.findIndex(img => img.id === selectedImage.id) < filteredImages.length - 1 : false;
  const hasPrevious = selectedImage ? filteredImages.findIndex(img => img.id === selectedImage.id) > 0 : false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Photography
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
            Explore our curated collection of stunning images from talented photographers around the world
          </p>
          <div className="mt-8">
            <span className="inline-block bg-yellow-500 text-blue-900 px-6 py-2 rounded-full font-semibold">
              Premium Gallery Experience
            </span>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No images found matching your criteria.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      )}
    </div>
  );
};

export default Gallery;