import { useState } from 'react';

export default function Avatar({ src, name, size = 'md', online, className = '' }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return parts[0][0] + parts[1][0];
    return parts[0][0];
  };

  const showImage = src && !imgError;

  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={name || 'User'}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
      {online !== undefined && (
        <span className={`avatar-status ${online ? 'online' : ''}`} />
      )}
    </div>
  );
}
