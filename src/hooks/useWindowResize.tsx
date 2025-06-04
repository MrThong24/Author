import { useState, useEffect } from 'react';

// Custom hook to detect window resize
const useWindowResize = () => {
  const [hasResized, setHasResized] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  useEffect(() => {
    const handleResize = () => {
      // If the window size has changed, set hasResized to true
      if (window.innerWidth !== windowSize.width || window.innerHeight !== windowSize.height) {
        setHasResized(true);
      }
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [windowSize]); // Dependency array includes windowSize to track changes

  return hasResized;
};

export default useWindowResize;
