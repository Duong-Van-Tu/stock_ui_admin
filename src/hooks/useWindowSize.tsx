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
    if (typeof window !== 'undefined') {
      const updateSize = () => {
        const width = window.innerWidth;
        setSize({
          width,
          height: window.innerHeight,
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024
        });
      };

      updateSize();
      window.addEventListener('resize', updateSize);

      return () => {
        window.removeEventListener('resize', updateSize);
      };
    }
  }, []);

  return size;
}
