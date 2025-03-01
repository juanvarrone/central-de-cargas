
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
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                anchor: new google.maps.Point(10, 34),
                scaledSize: new google.maps.Size(20, 34)
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
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                anchor: new google.maps.Point(10, 34),
                scaledSize: new google.maps.Size(20, 34)
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
