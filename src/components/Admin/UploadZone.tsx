import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, FileImage } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadZoneProps {
  onFilesSelected: (files: FileList) => void;
  multiple?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  multiple = true,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}) => {
  const [previews, setPreviews] = useState<{ file: File; preview: string; error?: string }[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} is too large. Max size is ${maxSize}MB`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} is not a supported image format`);
        } else {
          toast.error(`${file.name}: ${error.message}`);
        }
      });
    });

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const newPreviews = acceptedFiles.map(file => {
        // Validate file size manually as well
        if (file.size > maxSize * 1024 * 1024) {
          return {
            file,
            preview: '',
            error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB > ${maxSize}MB)`
          };
        }

        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
          return {
            file,
            preview: '',
            error: 'Unsupported file format'
          };
        }

        return {
          file,
          preview: URL.createObjectURL(file)
        };
      });

      setPreviews(prev => [...prev, ...newPreviews]);

      // Only pass valid files
      const validFiles = newPreviews.filter(p => !p.error).map(p => p.file);
      if (validFiles.length > 0) {
        const dataTransfer = new DataTransfer();
        [...previews.map(p => p.file), ...validFiles].forEach(file => {
          dataTransfer.items.add(file);
        });
        
        onFilesSelected(dataTransfer.files);
        toast.success(`${validFiles.length} file(s) ready for upload`);
      }

      // Show errors for invalid files
      const invalidFiles = newPreviews.filter(p => p.error);
      if (invalidFiles.length > 0) {
        toast.error(`${invalidFiles.length} file(s) rejected due to errors`);
      }
    }
  }, [onFilesSelected, maxSize, previews, acceptedTypes]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    multiple,
    maxSize: maxSize * 1024 * 1024,
    disabled: false
  });

  const removePreview = (index: number) => {
    const removedPreview = previews[index];
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    
    // Revoke object URL to prevent memory leaks
    if (removedPreview.preview) {
      URL.revokeObjectURL(removedPreview.preview);
    }
    
    // Update file list
    const dataTransfer = new DataTransfer();
    newPreviews.filter(p => !p.error).forEach(({ file }) => {
      dataTransfer.items.add(file);
    });
    onFilesSelected(dataTransfer.files);
  };

  const clearAll = () => {
    // Revoke all object URLs
    previews.forEach(preview => {
      if (preview.preview) {
        URL.revokeObjectURL(preview.preview);
      }
    });
    
    setPreviews([]);
    const dataTransfer = new DataTransfer();
    onFilesSelected(dataTransfer.files);
    toast.success('All files cleared');
  };

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      previews.forEach(preview => {
        if (preview.preview) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-blue-900 bg-blue-50'
            : isDragReject
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          <Upload className={`h-12 w-12 mb-4 ${
            isDragActive ? 'text-blue-900' : isDragReject ? 'text-red-500' : 'text-gray-400'
          }`} />
          
          {isDragActive ? (
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">Drop files here</h3>
              <p className="text-sm text-blue-700">Release to upload your images</p>
            </div>
          ) : isDragReject ? (
            <div>
              <h3 className="text-lg font-medium text-red-600 mb-2">Invalid files</h3>
              <p className="text-sm text-red-500">Please check file type and size</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop images here or click to browse
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Supports JPEG, PNG, WebP, GIF up to {maxSize}MB each
              </p>
              <div className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors inline-block">
                Select Files
              </div>
            </div>
          )}
        </div>
      </div>

      {previews.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Selected Files ({previews.filter(p => !p.error).length} valid, {previews.filter(p => p.error).length} errors)
            </h4>
            <button
              onClick={clearAll}
              className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {previews.map((item, index) => (
              <div key={index} className="relative group">
                <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  item.error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                }`}>
                  {item.error ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-red-400" />
                    </div>
                  ) : item.preview ? (
                    <img
                      src={item.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileImage className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => removePreview(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-600 truncate" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(item.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  {item.error && (
                    <div className="mt-1 flex items-center text-red-500">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span className="text-xs">{item.error}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;