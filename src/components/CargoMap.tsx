
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

  const center = origenCoords || {
    lat: -34.0,
    lng: -64.0,
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyD8ns70mGT3vZSmWPw7YOIduUiqB5RAl8g" libraries={["places"]}>
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
