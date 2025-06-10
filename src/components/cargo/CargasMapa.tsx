
import React, { useState, useCallback } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { useApiConfiguration } from "@/hooks/useApiConfiguration";
import GoogleMapContainer from "./map/GoogleMapContainer";
import CargoMarkers from "./map/CargoMarkers";
import CargoInfoWindow from "./map/CargoInfoWindow";
import { useCargoMap } from "./map/useCargoMap";

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface CargasMapaProps {
  filters?: Record<string, any>;
  showSearchBox?: boolean;
}

const CargasMapa = ({ filters = {}, showSearchBox = false }: CargasMapaProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  
  const { config, loading: apiKeyLoading } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const apiKey = config?.value || "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const { cargas, loading, selectedCarga, setSelectedCarga, handleMapLoad } = useCargoMap(filters);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    handleMapLoad(mapInstance);

    if (showSearchBox && isLoaded) {
      // Create search box
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Buscar ubicación...';
      input.style.cssText = `
        box-sizing: border-box;
        border: 1px solid transparent;
        width: 240px;
        height: 32px;
        padding: 0 12px;
        border-radius: 3px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        font-size: 14px;
        outline: none;
        text-overflow: ellipses;
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        background: white;
      `;

      mapInstance.getDiv().appendChild(input);

      const searchBoxInstance = new google.maps.places.SearchBox(input);
      setSearchBox(searchBoxInstance);

      // Bias the SearchBox results towards current map's viewport
      mapInstance.addListener('bounds_changed', () => {
        searchBoxInstance.setBounds(mapInstance.getBounds() as google.maps.LatLngBounds);
      });

      searchBoxInstance.addListener('places_changed', () => {
        const places = searchBoxInstance.getPlaces();

        if (places && places.length === 0) {
          return;
        }

        const bounds = new google.maps.LatLngBounds();
        places?.forEach((place) => {
          if (!place.geometry || !place.geometry.location) {
            console.log('Returned place contains no geometry');
            return;
          }

          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });

        mapInstance.fitBounds(bounds);
      });
    }
  }, [isLoaded, showSearchBox, handleMapLoad]);

  if (apiKeyLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-500">No se ha configurado la API key de Google Maps</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-500">Error al cargar Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Cargando mapa...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Cargando cargas...</p>
      </div>
    );
  }

  return (
    <GoogleMapContainer onLoad={onMapLoad}>
      <CargoMarkers cargas={cargas || []} onSelectCarga={setSelectedCarga} />
      <CargoInfoWindow selectedCarga={selectedCarga} onClose={() => setSelectedCarga(null)} />
    </GoogleMapContainer>
  );
};

export default CargasMapa;
