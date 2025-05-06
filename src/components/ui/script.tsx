
import React, { useEffect } from 'react';

interface ScriptProps {
  src: string;
  onLoad?: () => void;
}

export const Script: React.FC<ScriptProps> = ({ src, onLoad }) => {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${src}"]`);
    
    if (existingScript) {
      if (onLoad) onLoad();
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    // Handle loading
    if (onLoad) {
      script.onload = onLoad;
    }
    
    // Add to document
    document.body.appendChild(script);
    
    // Cleanup
    return () => {
      // Don't remove Google Maps script as it might be used elsewhere
      // Only remove if it's a custom script that won't be reused
      if (!src.includes('maps.googleapis.com')) {
        document.body.removeChild(script);
      }
    };
  }, [src, onLoad]);
  
  return null;
};
