import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Settings, 
  Save, 
  Upload, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Wand2
} from 'lucide-react';
import WatermarkEditor from '../../components/Admin/WatermarkEditor';
import { getImages } from '../../utils/storage';
import { Image as ImageType } from '../../types';

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

const Watermark: React.FC = () => {
  const [settings, setSettings] = useState<WatermarkSettings | null>(null);
  const [autoApply, setAutoApply] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [images] = useState<ImageType[]>(getImages());
  const [processing, setProcessing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    // Load saved watermark settings
    const savedSettings = localStorage.getItem('watermark_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedAutoApply = localStorage.getItem('watermark_auto_apply');
    if (savedAutoApply) {
      setAutoApply(JSON.parse(savedAutoApply));
    }
  }, []);

  const handleSaveSettings = (newSettings: WatermarkSettings) => {
    setSettings(newSettings);
    localStorage.setItem('watermark_settings', JSON.stringify(newSettings));
    localStorage.setItem('watermark_auto_apply', JSON.stringify(autoApply));
    setLastSaved(new Date());
    alert('Watermark settings saved successfully!');
  };

  const handleApplyToImage = async (image: ImageType) => {
    if (!settings) return;

    setProcessing(true);
    
    // Simulate watermark application
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    alert(`Watermark applied to "${image.title}" successfully!`);
  };

  const handleBulkApply = async () => {
    if (!settings) return;

    setProcessing(true);
    
    // Simulate bulk watermark application
    const selectedImages = images.filter(img => img.isPublic);
    
    for (let i = 0; i < selectedImages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setProcessing(false);
    alert(`Watermark applied to ${selectedImages.length} images successfully!`);
  };

  const presets = [
    {
      name: 'Bottom Right Text',
      settings: {
        type: 'text' as const,
        text: 'Gallery Pro',
        imageUrl: '',
        position: 'bottom-right' as const,
        opacity: 0.7,
        size: 24,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold' as const,
        rotation: 0,
        offsetX: 20,
        offsetY: 20,
        enabled: true
      }
    },
    {
      name: 'Center Diagonal',
      settings: {
        type: 'text' as const,
        text: 'Gallery Pro',
        imageUrl: '',
        position: 'center' as const,
        opacity: 0.3,
        size: 48,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold' as const,
        rotation: -45,
        offsetX: 0,
        offsetY: 0,
        enabled: true
      }
    },
    {
      name: 'Top Left Logo',
      settings: {
        type: 'image' as const,
        text: '',
        imageUrl: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=100',
        position: 'top-left' as const,
        opacity: 0.8,
        size: 32,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'normal' as const,
        rotation: 0,
        offsetX: 15,
        offsetY: 15,
        enabled: true
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Watermark Management</h1>
          <p className="text-gray-600 mt-1">Configure automatic watermarks for your images</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoApply"
              checked={autoApply}
              onChange={(e) => setAutoApply(e.target.checked)}
              className="w-4 h-4 text-blue-900 rounded focus:ring-blue-700"
            />
            <label htmlFor="autoApply" className="text-sm font-medium text-gray-700">
              Auto-apply to new uploads
            </label>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              settings?.enabled ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Watermark Status: {settings?.enabled ? 'Enabled' : 'Disabled'}
              </h3>
              <p className="text-sm text-gray-500">
                {settings?.enabled 
                  ? `${settings.type === 'text' ? 'Text' : 'Image'} watermark configured`
                  : 'No watermark configured'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {settings?.enabled ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => setSettings(preset.settings)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <h4 className="font-medium text-blue-900 mb-2">{preset.name}</h4>
              <p className="text-sm text-gray-600">
                {preset.settings.type === 'text' 
                  ? `Text: "${preset.settings.text}"`
                  : 'Image watermark'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Position: {preset.settings.position.replace('-', ' ')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Watermark Editor */}
      <WatermarkEditor
        previewImage={selectedImage?.url}
        onSave={handleSaveSettings}
        initialSettings={settings || undefined}
      />

      {/* Bulk Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apply to Existing Images */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Apply to Existing Images</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Public Images</p>
                <p className="text-sm text-gray-500">{images.filter(img => img.isPublic).length} images</p>
              </div>
              <button
                onClick={handleBulkApply}
                disabled={!settings?.enabled || processing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Wand2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>Apply Watermark</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {images.slice(0, 5).map((image) => (
                <div key={image.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <div className="flex items-center space-x-3">
                    <img
                      src={image.thumbnail}
                      alt={image.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{image.title}</p>
                      <p className="text-xs text-gray-500">{image.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Preview with this image"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleApplyToImage(image)}
                      disabled={!settings?.enabled || processing}
                      className="p-1 text-blue-900 hover:text-blue-700 disabled:opacity-50"
                      title="Apply watermark"
                    >
                      <Wand2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Settings</h3>
          
          {settings ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{settings.type}</span>
              </div>
              
              {settings.type === 'text' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Text:</span>
                  <span className="font-medium">"{settings.text}"</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium capitalize">{settings.position.replace('-', ' ')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Opacity:</span>
                <span className="font-medium">{Math.round(settings.opacity * 100)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{settings.size}px</span>
              </div>
              
              {settings.rotation !== 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rotation:</span>
                  <span className="font-medium">{settings.rotation}°</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Auto-apply:</span>
                <span className="font-medium">{autoApply ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No watermark settings configured</p>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => handleSaveSettings(settings!)}
                disabled={!settings}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-blue-900 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watermark;