
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { useApiConfiguration } from '@/hooks/useApiConfiguration';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
  apiKey: string;
  isApiKeyLoading: boolean;
  apiKeyError: Error | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config, loading: apiKeyLoading, error: configError } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const apiKey = config?.value || "";
  
  console.log('[GoogleMapsProvider] Status:', {
    apiKeyLoading,
    hasApiKey: !!apiKey,
    configError: !!configError
  });
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
    // Add timeout to prevent hanging
    id: "google-maps-script",
  });

  // Provide fallback when API key loading fails
  const shouldLoadMaps = !apiKeyLoading && !!apiKey;
  
  const contextValue: GoogleMapsContextType = {
    isLoaded: shouldLoadMaps ? isLoaded : false,
    loadError: configError || loadError,
    apiKey,
    isApiKeyLoading: apiKeyLoading,
    apiKeyError: configError,
  };

  return (
    <GoogleMapsContext.Provider value={contextValue}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};
