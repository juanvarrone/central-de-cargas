
import React from "react";
import { Marker } from "@react-google-maps/api";
import { TruckWithLocation, SelectedTruck } from "./useTruckMap";

interface TruckMarkersProps {
  trucks: TruckWithLocation[];
  onSelectTruck: (selectedTruck: SelectedTruck) => void;
}

const TruckMarkers = ({ trucks, onSelectTruck }: TruckMarkersProps) => {
  const getTruckIcon = () => ({
    path: "M8 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1V3zm1 2v7h6V5H9zM5 7v4h1V7H5zm12 0v4h1V7h-1z",
    fillColor: "#22c55e",
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "#ffffff",
    scale: 0.5, // Reducido de 2 a 0.5 (25% del tamaño original)
    anchor: new google.maps.Point(12, 24),
  });

  const getDestinationIcon = () => ({
    path: "M2 3h20v1H2V3zm0 2h20v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5zm2 2v10h16V7H4zm2 2h4v2H6V9zm6 0h4v2h-4V9zm-6 4h4v2H6v-2zm6 0h4v2h-4v-2z", // Ícono de bandera corregido
    fillColor: "#ef4444",
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: "#991b1b",
    scale: 0.375, // Reducido de 1.5 a 0.375 (25% del tamaño original)
    anchor: new google.maps.Point(12, 24),
  });

  return (
    <>
      {trucks.map((truck) => (
        <React.Fragment key={truck.id}>
          {/* Origen marker (truck icon) */}
          {truck.origen_lat && truck.origen_lng && (
            <Marker
              position={{
                lat: Number(truck.origen_lat),
                lng: Number(truck.origen_lng),
              }}
              icon={getTruckIcon()}
              onClick={() => onSelectTruck({ truck, tipo: "origen" })}
            />
          )}
          
          {/* Destino marker (if coordinates available) */}
          {truck.destino_lat && truck.destino_lng && (
            <Marker
              position={{
                lat: Number(truck.destino_lat),
                lng: Number(truck.destino_lng),
              }}
              icon={getDestinationIcon()}
              onClick={() => onSelectTruck({ truck, tipo: "destino" })}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default TruckMarkers;
