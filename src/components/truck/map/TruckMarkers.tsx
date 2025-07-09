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
    scale: 1.0, // Doble del tamaño actual
    anchor: new google.maps.Point(12, 24),
  });

  const getDestinationIcon = () => ({
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    fillColor: "#DC2626",
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "#991b1b",
    scale: 1.0,
    anchor: new google.maps.Point(12, 17),
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
