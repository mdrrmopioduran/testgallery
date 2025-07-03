import React, { useState, useRef, useEffect } from 'react';
import { Sliders, RotateCcw, Download, Wand2 } from 'lucide-react';
import { EnhancementOptions } from '../../types';

interface ImageEnhancerProps {
  imageUrl: string;
  onSave: (enhancedImageUrl: string) => void;
}

const ImageEnhancer: React.FC<ImageEnhancerProps> = ({ imageUrl, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enhancements, setEnhancements] = useState<EnhancementOptions>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0
  });
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      drawImage(img, enhancements);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (originalImage) {
      drawImage(originalImage, enhancements);
    }
  }, [enhancements, originalImage]);

  const drawImage = (img: HTMLImageElement, options: EnhancementOptions) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    // Apply filters
    ctx.filter = `
      brightness(${options.brightness}%)
      contrast(${options.contrast}%)
      saturate(${options.saturation}%)
      blur(${options.blur}px)
      sepia(${options.sepia}%)
      grayscale(${options.grayscale}%)
    `;

    ctx.drawImage(img, 0, 0);
  };

  const handleEnhancementChange = (key: keyof EnhancementOptions, value: number) => {
    setEnhancements(prev => ({ ...prev, [key]: value }));
  };

  const resetEnhancements = () => {
    setEnhancements({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0
    });
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const enhancedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(enhancedImageUrl);
  };

  const enhancementControls = [
    { key: 'brightness', label: 'Brightness', min: 0, max: 200, step: 1 },
    { key: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1 },
    { key: 'saturation', label: 'Saturation', min: 0, max: 200, step: 1 },
    { key: 'blur', label: 'Blur', min: 0, max: 10, step: 0.1 },
    { key: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1 },
    { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, step: 1 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-blue-900 flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          Image Enhancer
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={resetEnhancements}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
          >
            <Download className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Sliders className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-700">Adjustments</span>
          </div>
          
          {enhancementControls.map((control) => (
            <div key={control.key} className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {control.label}
                </label>
                <span className="text-sm text-gray-500">
                  {enhancements[control.key as keyof EnhancementOptions]}
                  {control.key === 'brightness' || control.key === 'contrast' || control.key === 'saturation' ? '%' : ''}
                </span>
              </div>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={enhancements[control.key as keyof EnhancementOptions]}
                onChange={(e) => handleEnhancementChange(
                  control.key as keyof EnhancementOptions, 
                  parseFloat(e.target.value)
                )}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Preview</h4>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
              style={{ maxHeight: '400px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEnhancer;