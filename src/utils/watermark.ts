export interface WatermarkSettings {
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

export const applyWatermark = (
  sourceImageUrl: string,
  settings: WatermarkSettings
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!settings.enabled) {
      resolve(sourceImageUrl);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Apply watermark
      ctx.save();
      ctx.globalAlpha = settings.opacity;

      if (settings.type === 'text') {
        applyTextWatermark(ctx, canvas.width, canvas.height, settings);
      } else if (settings.imageUrl) {
        applyImageWatermark(ctx, canvas.width, canvas.height, settings)
          .then(() => {
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          })
          .catch(reject);
        return;
      }

      ctx.restore();
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = () => {
      reject(new Error('Failed to load source image'));
    };

    img.src = sourceImageUrl;
  });
};

const applyTextWatermark = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  settings: WatermarkSettings
) => {
  // Set font
  ctx.font = `${settings.fontWeight} ${settings.size}px ${settings.fontFamily}`;
  ctx.fillStyle = settings.color;
  ctx.textBaseline = 'top';

  // Measure text
  const textMetrics = ctx.measureText(settings.text);
  const textWidth = textMetrics.width;
  const textHeight = settings.size;

  // Calculate position
  const position = calculateWatermarkPosition(
    canvasWidth,
    canvasHeight,
    textWidth,
    textHeight,
    settings
  );

  // Apply rotation
  if (settings.rotation !== 0) {
    ctx.translate(position.x + textWidth / 2, position.y + textHeight / 2);
    ctx.rotate((settings.rotation * Math.PI) / 180);
    ctx.translate(-textWidth / 2, -textHeight / 2);
  } else {
    ctx.translate(position.x, position.y);
  }

  // Add shadow for better visibility
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // Draw text
  ctx.fillText(settings.text, 0, 0);
};

const applyImageWatermark = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  settings: WatermarkSettings
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const watermarkImg = new Image();
    watermarkImg.crossOrigin = 'anonymous';
    
    watermarkImg.onload = () => {
      const aspectRatio = watermarkImg.width / watermarkImg.height;
      const watermarkWidth = settings.size * 2;
      const watermarkHeight = watermarkWidth / aspectRatio;

      const position = calculateWatermarkPosition(
        canvasWidth,
        canvasHeight,
        watermarkWidth,
        watermarkHeight,
        settings
      );

      if (settings.rotation !== 0) {
        ctx.translate(position.x + watermarkWidth / 2, position.y + watermarkHeight / 2);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        ctx.translate(-watermarkWidth / 2, -watermarkHeight / 2);
      } else {
        ctx.translate(position.x, position.y);
      }

      ctx.drawImage(watermarkImg, 0, 0, watermarkWidth, watermarkHeight);
      resolve();
    };

    watermarkImg.onerror = () => {
      reject(new Error('Failed to load watermark image'));
    };

    watermarkImg.src = settings.imageUrl;
  });
};

const calculateWatermarkPosition = (
  canvasWidth: number,
  canvasHeight: number,
  elementWidth: number,
  elementHeight: number,
  settings: WatermarkSettings
) => {
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

export const getWatermarkSettings = (): WatermarkSettings | null => {
  const settings = localStorage.getItem('watermark_settings');
  return settings ? JSON.parse(settings) : null;
};

export const saveWatermarkSettings = (settings: WatermarkSettings): void => {
  localStorage.setItem('watermark_settings', JSON.stringify(settings));
};

export const isAutoApplyEnabled = (): boolean => {
  const autoApply = localStorage.getItem('watermark_auto_apply');
  return autoApply ? JSON.parse(autoApply) : false;
};

export const setAutoApply = (enabled: boolean): void => {
  localStorage.setItem('watermark_auto_apply', JSON.stringify(enabled));
};

// Batch watermark application
export const applyWatermarkBatch = async (
  imageUrls: string[],
  settings: WatermarkSettings,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> => {
  const results: string[] = [];
  
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const watermarkedUrl = await applyWatermark(imageUrls[i], settings);
      results.push(watermarkedUrl);
      
      if (onProgress) {
        onProgress(i + 1, imageUrls.length);
      }
    } catch (error) {
      console.error(`Failed to apply watermark to image ${i}:`, error);
      results.push(imageUrls[i]); // Use original if watermarking fails
    }
  }
  
  return results;
};