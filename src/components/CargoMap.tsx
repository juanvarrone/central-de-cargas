
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

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

  const center = {
    lat: -34.0,
    lng: -64.0,
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyAyjXoR5-0I-FHD-4NwTvTrF7LWIciirbU">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={origenCoords || center}
        zoom={4}
      >
        {origenCoords && (
          <Marker
            position={origenCoords}
            draggable={true}
            onDragEnd={(e) => {
              onOrigenChange({
                lat: e.latLng!.lat(),
                lng: e.latLng!.lng(),
              });
            }}
            title="Origen"
          />
        )}
        {destinoCoords && (
          <Marker
            position={destinoCoords}
            draggable={true}
            onDragEnd={(e) => {
              onDestinoChange({
                lat: e.latLng!.lat(),
                lng: e.latLng!.lng(),
              });
            }}
            title="Destino"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default CargoMap;
