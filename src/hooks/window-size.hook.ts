'use client';

import { useEffect, useState } from 'react';

export function useWindowSize() {
  const getSize = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return {
        width,
        height: window.innerHeight,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      };
    } else {
      return {
        width: 0,
        height: 0,
        isMobile: false,
        isTablet: false,
        isDesktop: false
      };
    }
  };

  const [size, setSize] = useState(getSize);

  useEffect(() => {
    const updateSize = () => {
      setSize(getSize());
    };

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}
