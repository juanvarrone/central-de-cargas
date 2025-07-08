
import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { useGoogleMaps } from "@/context/GoogleMapsContext";
import { geocodeAddress } from "@/utils/geocoding";

interface PublishCargoMapProps {
  origen: string;
  destino: string;
  className?: string;
}

const PublishCargoMap = ({ origen, destino, className = "" }: PublishCargoMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [origenCoords, setOrigenCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const { isLoaded, loadError, apiKey, isApiKeyLoading, apiKeyError } = useGoogleMaps();

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const defaultCenter = {
    lat: -34.0,
    lng: -64.0,
  };

  // Geocode addresses when they change
  useEffect(() => {
    const geocodeAddresses = async () => {
      if (!isLoaded || !window.google) return;

      try {
        if (origen) {
          const origenResult = await geocodeAddress(origen);
          setOrigenCoords(origenResult);
        }

        if (destino) {
          const destinoResult = await geocodeAddress(destino);
          setDestinoCoords(destinoResult);
        }
      } catch (error) {
        console.error("Error geocoding addresses:", error);
      }
    };

    geocodeAddresses();
  }, [origen, destino, isLoaded]);

  // Fit bounds when coordinates are available
  useEffect(() => {
    if (!map || (!origenCoords && !destinoCoords)) return;

    try {
      const bounds = new google.maps.LatLngBounds();
      
      if (origenCoords) {
        bounds.extend(origenCoords);
      }
      
      if (destinoCoords) {
        bounds.extend(destinoCoords);
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        
        // Set a minimum zoom level
        const listener = google.maps.event.addListener(map, "idle", () => {
          if (map.getZoom() && map.getZoom()! > 15) {
            map.setZoom(15);
          }
          google.maps.event.removeListener(listener);
        });
      }
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [map, origenCoords, destinoCoords]);

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const getMarkerOptions = (isOrigin: boolean) => ({
    icon: {
      path: isOrigin 
        ? "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        : "M2 3l20 0 0 2-2 0 0 12-16 0 0-12-2 0 0-2z M6 5l0 10 12 0 0-10-12 0z",
      fillColor: isOrigin ? "#22c55e" : "#ef4444",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: isOrigin ? "#166534" : "#991b1b",
      scale: 1.0,
      anchor: new google.maps.Point(12, isOrigin ? 17 : 8),
    },
  });

  if (isApiKeyLoading) {
    return (
      <div className={`h-48 flex items-center justify-center bg-gray-100 rounded ${className}`}>
        <p>Cargando configuración del mapa...</p>
      </div>
    );
  }

  if (apiKeyError) {
    return (
      <div className={`h-48 flex items-center justify-center bg-gray-100 rounded ${className}`}>
        <p className="text-red-500 text-sm">Error al cargar la configuración de Google Maps</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className={`h-48 flex items-center justify-center bg-gray-100 rounded ${className}`}>
        <p className="text-red-500 text-sm">No se ha configurado la API key de Google Maps</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`h-48 flex items-center justify-center bg-gray-100 rounded ${className}`}>
        <p className="text-red-500 text-sm">Error al cargar Google Maps: {loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`h-48 flex items-center justify-center bg-gray-100 rounded ${className}`}>
        <p>Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={5}
        onLoad={handleMapLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {origenCoords && (
          <MarkerF
            position={origenCoords}
            options={getMarkerOptions(true)}
            title={`Origen: ${origen}`}
          />
        )}
        {destinoCoords && (
          <MarkerF
            position={destinoCoords}
            options={getMarkerOptions(false)}
            title={`Destino: ${destino}`}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default PublishCargoMap;
