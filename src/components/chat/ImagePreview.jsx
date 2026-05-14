import { useEffect } from 'react';
import { IoClose, IoDownload } from 'react-icons/io5';

export default function ImagePreview({ src, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UBConvo_Image_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <button className="image-preview-close" onClick={onClose}>
        <IoClose />
      </button>

      <div className="image-preview-content" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt="Preview" />
      </div>

      <div className="image-preview-actions">
        <button onClick={handleDownload}>
          <IoDownload /> Download
        </button>
      </div>
    </div>
  );
}
