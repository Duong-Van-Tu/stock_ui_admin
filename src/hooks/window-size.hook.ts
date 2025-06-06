'use client';

import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  useEffect(() => {
    const getSize = () => {
      const width = window.innerWidth;
      return {
        width,
        height: window.innerHeight,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      };
    };

    const handleResize = () => {
      setSize(getSize());
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
