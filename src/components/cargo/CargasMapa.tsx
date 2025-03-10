
import React, { useMemo } from "react";
import { LoadScript, Libraries } from "@react-google-maps/api";
import { useCargoMap } from "./map/useCargoMap";
import GoogleMapContainer from "./map/GoogleMapContainer";
import CargoMarkers from "./map/CargoMarkers";
import CargoInfoWindow from "./map/CargoInfoWindow";
import { Filters } from "@/types/mapa-cargas";

interface CargasMapaProps {
  filters: Filters;
}

const CargasMapa = ({ filters }: CargasMapaProps) => {
  const libraries: Libraries = useMemo(() => ["places"], []);
  const { 
    cargas, 
    loading, 
    selectedCarga, 
    setSelectedCarga, 
    handleMapLoad 
  } = useCargoMap(filters);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        Cargando mapa...
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey="AIzaSyD8ns70mGT3vZSmWPw7YOIduUiqB5RAl8g"
      libraries={libraries}
      loadingElement={
        <div className="w-full h-full flex items-center justify-center">
          Cargando API de Google Maps...
        </div>
      }
    >
      <GoogleMapContainer onLoad={handleMapLoad}>
        <CargoMarkers 
          cargas={cargas} 
          onSelectCarga={setSelectedCarga} 
        />
        <CargoInfoWindow 
          selectedCarga={selectedCarga} 
          onClose={() => setSelectedCarga(null)}
        />
      </GoogleMapContainer>
    </LoadScript>
  );
};

export default CargasMapa;
