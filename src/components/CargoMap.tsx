
import { GoogleMap, LoadScript, Marker, Libraries } from "@react-google-maps/api";
import { useMemo } from "react";

type Coordinates = {
  lat: number;
  lng: number;
} | null;

interface CargoMapProps {
  origenCoords: Coordinates;
  destinoCoords: Coordinates;
  onOrigenChange: (coords: Coordinates) => void;
  onDestinoChange: (coords: Coordinates) => void;
}

const CargoMap = ({
  origenCoords,
  destinoCoords,
  onOrigenChange,
  onDestinoChange,
}: CargoMapProps) => {
  const mapContainerStyle = {
    width: "100%",
    height: "300px",
  };

  const center = origenCoords || {
    lat: -34.0,
    lng: -64.0,
  };

  const libraries: Libraries = useMemo(() => ["places"], []);

  const calculateDistance = () => {
    if (!origenCoords || !destinoCoords) return null;

    const rad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Radio de la Tierra en kilómetros

    const dLat = rad(destinoCoords.lat - origenCoords.lat);
    const dLon = rad(destinoCoords.lng - origenCoords.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(origenCoords.lat)) *
        Math.cos(rad(destinoCoords.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance);
  };

  const distance = calculateDistance();

  // Get optimized marker options for better mobile display
  const getMarkerOptions = (isOrigin: boolean) => {
    return {
      icon: {
        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
        fillColor: isOrigin ? "#22c55e" : "#ef4444",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: isOrigin ? "#166534" : "#991b1b",
        scale: 2,
        anchor: { x: 12, y: 22 },
      },
    };
  };

  return (
    <div className="space-y-2">
      <LoadScript 
        googleMapsApiKey="AIzaSyD8ns70mGT3vZSmWPw7YOIduUiqB5RAl8g"
        libraries={libraries}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={origenCoords && destinoCoords ? 6 : 4}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
          onClick={(e) => {
            if (!origenCoords) {
              onOrigenChange({
                lat: e.latLng?.lat() || 0,
                lng: e.latLng?.lng() || 0,
              });
            } else if (!destinoCoords) {
              onDestinoChange({
                lat: e.latLng?.lat() || 0,
                lng: e.latLng?.lng() || 0,
              });
            }
          }}
        >
          {origenCoords && (
            <Marker
              position={origenCoords}
              draggable={true}
              onDragEnd={(e) => {
                if (e.latLng) {
                  onOrigenChange({
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                  });
                }
              }}
              options={getMarkerOptions(true)}
            />
          )}
          {destinoCoords && (
            <Marker
              position={destinoCoords}
              draggable={true}
              onDragEnd={(e) => {
                if (e.latLng) {
                  onDestinoChange({
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                  });
                }
              }}
              options={getMarkerOptions(false)}
            />
          )}
        </GoogleMap>
      </LoadScript>
      {distance && (
        <p className="text-sm text-muted-foreground text-center">
          Distancia aproximada: {distance} km
        </p>
      )}
    </div>
  );
};

export default CargoMap;
