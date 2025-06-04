
import React from "react";
import { GoogleMap } from "@react-google-maps/api";

interface TruckGoogleMapContainerProps {
  children: React.ReactNode;
  onLoad: (map: google.maps.Map) => void;
}

const TruckGoogleMapContainer = ({ children, onLoad }: TruckGoogleMapContainerProps) => {
  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const center = {
    lat: -34.6118,
    lng: -58.3960, // Buenos Aires, Argentina
  };

  const options = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={6}
      options={options}
      onLoad={onLoad}
    >
      {children}
    </GoogleMap>
  );
};

export default TruckGoogleMapContainer;
