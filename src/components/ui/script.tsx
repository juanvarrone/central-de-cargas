
import React, { useEffect, useState } from 'react';

interface ScriptProps {
  src: string;
  onLoad?: () => void;
  id?: string;
  async?: boolean;
}

export const Script: React.FC<ScriptProps> = ({ src, onLoad, id, async = true }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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
  }, [src, onLoad, id, async]);
  
  return null;
};
