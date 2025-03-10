
import React from 'react';
import { MarkerF } from '@react-google-maps/api';
import { Carga, SelectedCarga } from '@/types/mapa-cargas';

interface CargoMarkersProps {
  cargas: Carga[];
  onSelectCarga: (selectedCarga: SelectedCarga) => void;
}

const CargoMarkers = ({ cargas, onSelectCarga }: CargoMarkersProps) => {
  // Marker options function
  const getMarkerOptions = (isOrigin: boolean) => ({
    icon: {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: isOrigin ? "#22c55e" : "#ef4444",
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: isOrigin ? "#166534" : "#991b1b",
      scale: 2,
      anchor: new google.maps.Point(12, 17),
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
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default CargoMarkers;
