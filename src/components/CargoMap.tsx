
import { GoogleMap, LoadScript, Marker, Libraries } from "@react-google-maps/api";
import { Package, Truck } from "lucide-react";
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
    const R = 6371; // Earth's radius in kilometers

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
              icon={{
                path: "M10 17h4V5H2v12h3m5 0h4 M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1",
                fillColor: "#1d4ed8",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#1d4ed8",
                scale: 1.5,
              }}
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
              icon={{
                path: "M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",
                fillColor: "#059669",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#059669",
                scale: 1.5,
              }}
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
