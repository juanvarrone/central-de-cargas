
import React, { useMemo, useState, useEffect } from "react";
import { LoadScript, Libraries } from "@react-google-maps/api";
import { useCargoMap } from "./map/useCargoMap";
import GoogleMapContainer from "./map/GoogleMapContainer";
import CargoMarkers from "./map/CargoMarkers";
import CargoInfoWindow from "./map/CargoInfoWindow";
import { Filters } from "@/types/mapa-cargas";
import { useApiConfiguration } from "@/hooks/useApiConfiguration";
import { Loader2 } from "lucide-react";

interface CargasMapaProps {
  filters: Filters;
}

const CargasMapa = ({ filters }: CargasMapaProps) => {
  const libraries: Libraries = useMemo(() => ["places"], []);
  const { 
    cargas, 
    loading: cargasLoading, 
    selectedCarga, 
    setSelectedCarga, 
    handleMapLoad 
  } = useCargoMap(filters);

  const { config, loading: apiKeyLoading } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const [mapApiKey, setMapApiKey] = useState<string>("");

  useEffect(() => {
    if (config?.value) {
      setMapApiKey(config.value);
    }
  }, [config]);

  if (apiKeyLoading || cargasLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (!mapApiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          No se ha configurado la API key de Google Maps.
        </p>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={mapApiKey}
      libraries={libraries}
      loadingElement={
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p>Cargando API de Google Maps...</p>
          </div>
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
