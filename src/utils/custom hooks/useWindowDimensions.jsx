import { useState, useEffect } from "react";

export default function useWindowDimensions() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowDimensions, setWindowDimensions] = useState({
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowDimensions((prev) => ({
        ...prev,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      }));
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowDimensions;
}
