import React, { useState, MouseEvent } from 'react';

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, className = '' }) => {
  const [backgroundPosition, setBackgroundPosition] = useState('50% 50%');
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  return (
    <div
      className={`relative overflow-hidden cursor-crosshair ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Original Image - visible when not hovered */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover object-center transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {/* Zoomed Image Background - visible when hovered */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url(${src})`,
          backgroundPosition: backgroundPosition,
          backgroundSize: '250%', // 2.5x zoom
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
};

export default ZoomableImage;
