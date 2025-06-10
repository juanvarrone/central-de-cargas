
import React, { useEffect, useState } from 'react';

interface ScriptProps {
  src: string;
  onLoad?: () => void;
  id?: string;
  async?: boolean;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
}

export const Script: React.FC<ScriptProps> = ({ 
  src, 
  onLoad, 
  id, 
  async = true,
  strategy = 'afterInteractive' 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if we're trying to load Google Maps
    const isGoogleMaps = src.includes('maps.googleapis.com');
    
    // For Google Maps, check if it's already loaded globally
    if (isGoogleMaps && window.google && window.google.maps) {
      setLoaded(true);
      if (onLoad) onLoad();
      return;
    }
    
    function loadScript() {
      // Check if script already exists
      const scriptId = id || src.replace(/[^\w\s]/g, '_');
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (existingScript) {
        // Script exists, check if it's loaded
        if (existingScript.dataset.loaded === 'true' || (isGoogleMaps && window.google)) {
          setLoaded(true);
          if (onLoad) onLoad();
        } else {
          // Script exists but still loading
          const handleExistingLoad = () => {
            setLoaded(true);
            if (onLoad) onLoad();
          };
          
          existingScript.addEventListener('load', handleExistingLoad);
          existingScript.addEventListener('error', () => setError(new Error(`Failed to load script: ${src}`)));
          
          return () => {
            existingScript.removeEventListener('load', handleExistingLoad);
          };
        }
        return;
      }
      
      // Create script element
      const script = document.createElement('script');
      script.src = src;
      script.id = scriptId;
      script.async = async;
      
      // Handle loading
      script.onload = () => {
        script.dataset.loaded = 'true';
        setLoaded(true);
        if (onLoad) onLoad();
      };
      
      script.onerror = () => {
        setError(new Error(`Failed to load script: ${src}`));
        console.error(`Failed to load script: ${src}`);
      };
      
      // Add to document head instead of body for better compatibility
      document.head.appendChild(script);
      
      // Cleanup function
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }

    // Load based on strategy
    if (strategy === 'lazyOnload') {
      const handleLoad = () => {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => loadScript());
        } else {
          setTimeout(loadScript, 1000);
        }
      };

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    } else {
      return loadScript();
    }
  }, [src, onLoad, id, async, strategy]);
  
  return null;
};
