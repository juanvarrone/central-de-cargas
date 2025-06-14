
import React, { useState, useEffect, useCallback } from "react";
import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
import { useApiConfiguration } from "@/hooks/useApiConfiguration";
import { geocodeAddress } from "@/utils/geocoding";
import { MapPin, Flag } from "lucide-react";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface PublishCargoMapProps {
  origen: string;
  destino: string;
  className?: string;
}

const PublishCargoMap = ({ origen, destino, className = "" }: PublishCargoMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [origenCoords, setOrigenCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const { config, loading: apiKeyLoading } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const apiKey = config?.value || "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

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

      if (origen) {
        const origenResult = await geocodeAddress(origen);
        setOrigenCoords(origenResult);
      }

      if (destino) {
        const destinoResult = await geocodeAddress(destino);
        setDestinoCoords(destinoResult);
      }
    };

    geocodeAddresses();
  }, [origen, destino, isLoaded]);

  // Fit bounds when coordinates are available
  useEffect(() => {
    if (!map || (!origenCoords && !destinoCoords)) return;

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
  }, [map, origenCoords, destinoCoords]);

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const getMarkerOptions = (isOrigin: boolean) => ({
    icon: {
      // Usar pin para origen y bandera para destino
      path: isOrigin 
        ? "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        : "M2 2h20v3H2V2zm0 4h20v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6z", // Bandera simple
      fillColor: isOrigin ? "#22c55e" : "#ef4444",
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: isOrigin ? "#166534" : "#991b1b",
      scale: 2,
      anchor: new google.maps.Point(12, isOrigin ? 17 : 2), // Diferentes puntos de anclaje
    },
  });

  if (apiKeyLoading) {
    return (
      <div className={`h-48 flex items-center justify-center bg-gray-100 rounded ${className}`}>
        <p>Cargando configuración del mapa...</p>
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
        <p className="text-red-500 text-sm">Error al cargar Google Maps</p>
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
