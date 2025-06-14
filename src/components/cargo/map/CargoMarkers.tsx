
import React from 'react';
import { MarkerF } from '@react-google-maps/api';
import { Carga, SelectedCarga } from '@/types/mapa-cargas';

interface CargoMarkersProps {
  cargas: Carga[];
  onSelectCarga: (selectedCarga: SelectedCarga) => void;
}

const CargoMarkers = ({ cargas, onSelectCarga }: CargoMarkersProps) => {
  // Return early if cargas is not an array or is empty
  if (!Array.isArray(cargas) || cargas.length === 0) {
    return null;
  }

  // Marker options function with proper anchor point for consistent display at all zoom levels
  const getMarkerOptions = (isOrigin: boolean) => ({
    icon: {
      // Pin para origen, bandera para destino
      path: isOrigin 
        ? "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        : "M2 3h20v1H2V3zm0 2h20v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5zm2 2v10h16V7H4zm2 2h4v2H6V9zm6 0h4v2h-4V9zm-6 4h4v2H6v-2zm6 0h4v2h-4v-2z", // Ícono de bandera corregido
      fillColor: isOrigin ? "#22c55e" : "#ef4444",
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: isOrigin ? "#166534" : "#991b1b",
      scale: 0.5, // Reducido de 2 a 0.5 (25% del tamaño original)
      anchor: new google.maps.Point(12, isOrigin ? 17 : 2), // Diferentes puntos de anclaje
    },
  });

  return (
    <>
      {cargas.map((carga) => (
        <React.Fragment key={carga.id}>
          {carga.origen_lat && carga.origen_lng && (
            <MarkerF
              position={{
                lat: carga.origen_lat,
                lng: carga.origen_lng,
              }}
              onClick={() => onSelectCarga({ carga, tipo: "origen" })}
              options={getMarkerOptions(true)}
              zIndex={2} // Higher z-index to ensure origin markers appear above others
            />
          )}
          {carga.destino_lat && carga.destino_lng && (
            <MarkerF
              position={{
                lat: carga.destino_lat,
                lng: carga.destino_lng,
              }}
              onClick={() => onSelectCarga({ carga, tipo: "destino" })}
              options={getMarkerOptions(false)}
              zIndex={1}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default CargoMarkers;
