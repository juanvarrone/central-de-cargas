
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
    // For beforeInteractive, we load immediately
    if (strategy === 'lazyOnload') {
      // For lazy loading, we only load when idle
      const handleLoad = () => {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => loadScript());
        } else {
          // Fallback for browsers that don't support requestIdleCallback
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
      // For afterInteractive (default) or beforeInteractive
      loadScript();
    }
    
    // Script loading logic
    function loadScript() {
      // Check if script already exists
      const scriptId = id || src.replace(/[^\w\s]/g, '_');
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (existingScript) {
        // Script exists, check if it's loaded
        if (existingScript.dataset.loaded === 'true') {
          setLoaded(true);
          if (onLoad) onLoad();
        } else {
          // Script exists but still loading
          const handleExistingLoad = () => {
            setLoaded(true);
            if (onLoad) onLoad();
          };
          
          existingScript.addEventListener('load', handleExistingLoad);
          existingScript.addEventListener('error', (e) => setError(new Error(`Failed to load script: ${src}`)));
          
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
      
      script.onerror = (e) => {
        setError(new Error(`Failed to load script: ${src}`));
        console.error(`Failed to load script: ${src}`, e);
      };
      
      // Add to document
      document.body.appendChild(script);
      
      // Cleanup
      return () => {
        // Don't remove Google Maps script as it might be used elsewhere
        // Only remove if it's a custom script that won't be reused
        if (!src.includes('maps.googleapis.com') && document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [src, onLoad, id, async, strategy]);
  
  return null;
};
