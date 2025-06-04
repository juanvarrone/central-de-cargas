
import React, { useMemo, useState, useEffect } from "react";
import { LoadScript, Libraries } from "@react-google-maps/api";
import { useTruckMap } from "./map/useTruckMap";
import TruckGoogleMapContainer from "./map/TruckGoogleMapContainer";
import TruckMarkers from "./map/TruckMarkers";
import TruckInfoWindow from "./map/TruckInfoWindow";
import { TruckFilters } from "@/types/truck";
import { useApiConfiguration } from "@/hooks/useApiConfiguration";
import { Loader2 } from "lucide-react";

interface TrucksMapaProps {
  filters: TruckFilters;
}

const TrucksMapa = ({ filters }: TrucksMapaProps) => {
  const libraries: Libraries = useMemo(() => ["places"], []);
  const { 
    trucks, 
    loading: trucksLoading, 
    selectedTruck, 
    setSelectedTruck, 
    handleMapLoad 
  } = useTruckMap(filters);

  const { config, loading: apiKeyLoading } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const [mapApiKey, setMapApiKey] = useState<string>("");

  useEffect(() => {
    if (config?.value) {
      setMapApiKey(config.value);
    }
  }, [config]);

  if (apiKeyLoading || trucksLoading) {
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
      <TruckGoogleMapContainer onLoad={handleMapLoad}>
        <TruckMarkers 
          trucks={trucks} 
          onSelectTruck={setSelectedTruck} 
        />
        <TruckInfoWindow 
          selectedTruck={selectedTruck} 
          onClose={() => setSelectedTruck(null)}
        />
      </TruckGoogleMapContainer>
    </LoadScript>
  );
};

export default TrucksMapa;
