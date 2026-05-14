import { ALLOWED_IMAGE_TYPES, ALLOWED_FILE_TYPES, MAX_IMAGE_SIZE, MAX_FILE_SIZE, FILE_ICONS } from './constants';

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function isImageFile(file) {
  return ALLOWED_IMAGE_TYPES.includes(file.type) || file.type?.startsWith('image/');
}

export function isAllowedFile(file) {
  return isImageFile(file) || ALLOWED_FILE_TYPES.includes(file.type);
}

export function validateFile(file) {
  const isImage = isImageFile(file);
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${formatFileSize(maxSize)}.`,
    };
  }

  if (!isAllowedFile(file)) {
    return {
      valid: false,
      error: 'File type not supported.',
    };
  }

  return { valid: true, error: null };
}

export function getFileIcon(mimeType) {
  return FILE_ICONS[mimeType] || '📎';
}

export function getFileExtension(fileName) {
  return fileName?.split('.').pop()?.toLowerCase() || '';
}

export function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function createThumbnail(file, maxWidth = 300, quality = 0.6) {
  return compressImage(file, maxWidth, quality);
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
