
import React, { useState, useCallback } from 'react';
import { GoogleMap } from '@react-google-maps/api';

interface GoogleMapContainerProps {
  children: React.ReactNode;
  onLoad?: (map: google.maps.Map) => void;
}

const GoogleMapContainer = ({ children, onLoad }: GoogleMapContainerProps) => {
  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const defaultCenter = {
    lat: -34.0,
    lng: -64.0,
  };

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    if (onLoad) onLoad(map);
  }, [onLoad]);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={4}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
      onLoad={handleMapLoad}
    >
      {children}
    </GoogleMap>
  );
};

export default GoogleMapContainer;
