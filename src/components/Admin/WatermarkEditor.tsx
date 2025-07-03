import React, { useState, useRef, useEffect } from 'react';
import { 
  Droplets, 
  Type, 
  Image as ImageIcon, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  Upload,
  Palette,
  Move,
  Maximize2
} from 'lucide-react';

interface WatermarkSettings {
  type: 'text' | 'image';
  text: string;
  imageUrl: string;
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  opacity: number;
  size: number;
  color: string;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  rotation: number;
  offsetX: number;
  offsetY: number;
  enabled: boolean;
}

interface WatermarkEditorProps {
  previewImage?: string;
  onSave: (settings: WatermarkSettings) => void;
  initialSettings?: WatermarkSettings;
}

const WatermarkEditor: React.FC<WatermarkEditorProps> = ({ 
  previewImage, 
  onSave, 
  initialSettings 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settings, setSettings] = useState<WatermarkSettings>(
    initialSettings || {
      type: 'text',
      text: 'Gallery Pro',
      imageUrl: '',
      position: 'bottom-right',
      opacity: 0.7,
      size: 24,
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      rotation: 0,
      offsetX: 20,
      offsetY: 20,
      enabled: true
    }
  );
  
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const defaultPreviewImage = 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800';

  useEffect(() => {
    if (previewEnabled) {
      drawPreview();
    }
  }, [settings, previewEnabled, previewImage]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Set canvas size
      canvas.width = 800;
      canvas.height = (img.height / img.width) * 800;

      // Draw main image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (settings.enabled && previewEnabled) {
        drawWatermark(ctx, canvas.width, canvas.height);
      }
    };
    img.src = previewImage || defaultPreviewImage;
  };

  const drawWatermark = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    ctx.save();
    
    // Set opacity
    ctx.globalAlpha = settings.opacity;

    if (settings.type === 'text') {
      drawTextWatermark(ctx, canvasWidth, canvasHeight);
    } else {
      drawImageWatermark(ctx, canvasWidth, canvasHeight);
    }

    ctx.restore();
  };

  const drawTextWatermark = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    // Set font
    ctx.font = `${settings.fontWeight} ${settings.size}px ${settings.fontFamily}`;
    ctx.fillStyle = settings.color;
    ctx.textBaseline = 'top';

    // Measure text
    const textMetrics = ctx.measureText(settings.text);
    const textWidth = textMetrics.width;
    const textHeight = settings.size;

    // Calculate position
    const position = calculatePosition(canvasWidth, canvasHeight, textWidth, textHeight);

    // Apply rotation
    if (settings.rotation !== 0) {
      ctx.translate(position.x + textWidth / 2, position.y + textHeight / 2);
      ctx.rotate((settings.rotation * Math.PI) / 180);
      ctx.translate(-textWidth / 2, -textHeight / 2);
    } else {
      ctx.translate(position.x, position.y);
    }

    // Draw text with shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText(settings.text, 0, 0);
  };

  const drawImageWatermark = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    if (!settings.imageUrl) return;

    const watermarkImg = new Image();
    watermarkImg.crossOrigin = 'anonymous';
    watermarkImg.onload = () => {
      const aspectRatio = watermarkImg.width / watermarkImg.height;
      const watermarkWidth = settings.size * 2;
      const watermarkHeight = watermarkWidth / aspectRatio;

      const position = calculatePosition(canvasWidth, canvasHeight, watermarkWidth, watermarkHeight);

      if (settings.rotation !== 0) {
        ctx.translate(position.x + watermarkWidth / 2, position.y + watermarkHeight / 2);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        ctx.translate(-watermarkWidth / 2, -watermarkHeight / 2);
      } else {
        ctx.translate(position.x, position.y);
      }

      ctx.drawImage(watermarkImg, 0, 0, watermarkWidth, watermarkHeight);
    };
    watermarkImg.src = settings.imageUrl;
  };

  const calculatePosition = (canvasWidth: number, canvasHeight: number, elementWidth: number, elementHeight: number) => {
    let x = 0, y = 0;

    switch (settings.position) {
      case 'top-left':
        x = settings.offsetX;
        y = settings.offsetY;
        break;
      case 'top-center':
        x = (canvasWidth - elementWidth) / 2 + settings.offsetX;
        y = settings.offsetY;
        break;
      case 'top-right':
        x = canvasWidth - elementWidth - settings.offsetX;
        y = settings.offsetY;
        break;
      case 'center-left':
        x = settings.offsetX;
        y = (canvasHeight - elementHeight) / 2 + settings.offsetY;
        break;
      case 'center':
        x = (canvasWidth - elementWidth) / 2 + settings.offsetX;
        y = (canvasHeight - elementHeight) / 2 + settings.offsetY;
        break;
      case 'center-right':
        x = canvasWidth - elementWidth - settings.offsetX;
        y = (canvasHeight - elementHeight) / 2 + settings.offsetY;
        break;
      case 'bottom-left':
        x = settings.offsetX;
        y = canvasHeight - elementHeight - settings.offsetY;
        break;
      case 'bottom-center':
        x = (canvasWidth - elementWidth) / 2 + settings.offsetX;
        y = canvasHeight - elementHeight - settings.offsetY;
        break;
      case 'bottom-right':
        x = canvasWidth - elementWidth - settings.offsetX;
        y = canvasHeight - elementHeight - settings.offsetY;
        break;
    }

    return { x, y };
  };

  const handleSettingChange = (key: keyof WatermarkSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  const handleReset = () => {
    setSettings({
      type: 'text',
      text: 'Gallery Pro',
      imageUrl: '',
      position: 'bottom-right',
      opacity: 0.7,
      size: 24,
      color: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      rotation: 0,
      offsetX: 20,
      offsetY: 20,
      enabled: true
    });
  };

  const handleDownloadPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'watermark-preview.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      handleSettingChange('imageUrl', imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const positionOptions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'center-left', label: 'Center Left' },
    { value: 'center', label: 'Center' },
    { value: 'center-right', label: 'Center Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' }
  ];

  const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-blue-900 flex items-center">
          <Droplets className="h-5 w-5 mr-2" />
          Watermark Editor
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewEnabled(!previewEnabled)}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {previewEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>Preview</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleDownloadPreview}
            className="flex items-center space-x-1 px-3 py-2 text-blue-900 hover:text-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="watermarkEnabled"
              checked={settings.enabled}
              onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
            />
            <label htmlFor="watermarkEnabled" className="ml-2 text-sm font-medium text-gray-700">
              Enable watermark
            </label>
          </div>

          {/* Watermark Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Watermark Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="watermarkType"
                  value="text"
                  checked={settings.type === 'text'}
                  onChange={(e) => handleSettingChange('type', e.target.value)}
                  className="w-4 h-4 text-blue-900 focus:ring-blue-700"
                />
                <Type className="h-4 w-4 ml-2 mr-1" />
                <span className="text-sm">Text</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="watermarkType"
                  value="image"
                  checked={settings.type === 'image'}
                  onChange={(e) => handleSettingChange('type', e.target.value)}
                  className="w-4 h-4 text-blue-900 focus:ring-blue-700"
                />
                <ImageIcon className="h-4 w-4 ml-2 mr-1" />
                <span className="text-sm">Image</span>
              </label>
            </div>
          </div>

          {/* Text Settings */}
          {settings.type === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={settings.text}
                  onChange={(e) => handleSettingChange('text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="Enter watermark text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Weight
                  </label>
                  <select
                    value={settings.fontWeight}
                    onChange={(e) => handleSettingChange('fontWeight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.color}
                    onChange={(e) => handleSettingChange('color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.color}
                    onChange={(e) => handleSettingChange('color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Image Settings */}
          {settings.type === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Watermark Image
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="watermarkImageUpload"
                />
                <label
                  htmlFor="watermarkImageUpload"
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Image</span>
                </label>
                {settings.imageUrl && (
                  <img
                    src={settings.imageUrl}
                    alt="Watermark preview"
                    className="w-full h-20 object-contain border border-gray-200 rounded"
                  />
                )}
              </div>
            </div>
          )}

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <select
              value={settings.position}
              onChange={(e) => handleSettingChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            >
              {positionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size: {settings.size}px
            </label>
            <input
              type="range"
              min="12"
              max="100"
              value={settings.size}
              onChange={(e) => handleSettingChange('size', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opacity: {Math.round(settings.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.opacity}
              onChange={(e) => handleSettingChange('opacity', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Rotation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rotation: {settings.rotation}°
            </label>
            <input
              type="range"
              min="-45"
              max="45"
              value={settings.rotation}
              onChange={(e) => handleSettingChange('rotation', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Offset */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offset X: {settings.offsetX}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.offsetX}
                onChange={(e) => handleSettingChange('offsetX', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offset Y: {settings.offsetY}px
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.offsetY}
                onChange={(e) => handleSettingChange('offsetY', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Preview</h4>
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 bg-white"
                style={{ maxHeight: '500px' }}
              />
              {!previewEnabled && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <EyeOff className="h-8 w-8 mx-auto mb-2" />
                    <p>Preview disabled</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatermarkEditor;