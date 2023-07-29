import React, { useEffect, useState, useRef } from 'react';
import './IndexBackground.css';

function IndexBackground() {
  const imageUrls = [
    'https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/index-bg-1.webp',
    'https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/index-bg-2.webp',
    'https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/index-bg-3.webp',
    'https://res.cloudinary.com/dx5utqv2s/image/upload/v1686214597/Image/index-bg-4.webp'
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previousImageIndex, setPreviousImageIndex] = useState(null);

  const currentImageIndexRef = useRef(currentImageIndex);
  const previousImageIndexRef = useRef(previousImageIndex);

  useEffect(() => {
    const intervalId = setInterval(() => {
      previousImageIndexRef.current = currentImageIndexRef.current;
      currentImageIndexRef.current = (currentImageIndexRef.current + 1) % imageUrls.length;
      setPreviousImageIndex(previousImageIndexRef.current);
      setCurrentImageIndex(currentImageIndexRef.current);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [imageUrls.length]);

  return (
    <div className='index-bg'>
      <div className='index-bg-mat'></div>
      {imageUrls.map((url, index) => (
        <div
          key={url}
          className={`index-bg-image ${index === currentImageIndex ? 'active zoom' : ''} ${index === previousImageIndex ? 'zoom' : ''}`}
          style={{ backgroundImage: `url(${url})` }}
        />
      ))}
    </div>
  );
}

export default IndexBackground;
