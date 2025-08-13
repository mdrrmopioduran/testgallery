import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Camera, Search, Filter, Grid, List } from 'lucide-react';
import { Image as ImageType } from '../types';
import { apiClient } from '../utils/api';
import ImageCard from '../components/Gallery/ImageCard';
import Lightbox from '../components/Gallery/Lightbox';
import FilterBar from '../components/Gallery/FilterBar';

const Gallery: React.FC = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredImages, setFilteredImages] = useState<ImageType[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadImages = async () => {
      loadImagesFromSupabase();
    };
    loadImages();
  }, []);

  const loadImagesFromSupabase = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getImages({ is_public: true });
      if (response.data) {
        const formattedImages = response.data.map((img: any) => ({
          id: img.id,
          title: img.title,
          description: img.description,
          url: img.file_path,
          thumbnail: img.thumbnail_path || img.file_path,
          category: img.categories?.name || 'Uncategorized',
          tags: img.image_tags?.map((tag: any) => tag.tag) || [],
          uploadDate: new Date(img.created_at),
          size: img.file_size,
          dimensions: { width: img.width || 1920, height: img.height || 1080 },
          userId: img.user_id,
          isPublic: img.is_public,
          likes: img.likes_count,
          views: img.views_count
        }));
        setImages(formattedImages);
        setFilteredImages(formattedImages);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Camera className="h-12 w-12 text-yellow-400" />
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl font-bold">
                Gallery Pro
              </h1>
              <p className="text-lg text-blue-200">Professional Image Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Loading images...</span>
            </div>
          </div>
        ) : (
          <>
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
                <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                <p className="text-gray-500">
                  {images.length === 0 
                    ? 'No images have been uploaded yet.' 
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
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
          </>
        )}
      </div>
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