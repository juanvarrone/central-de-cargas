
import { useState, useEffect, useCallback } from "react";
import { GoogleMap, InfoWindow, LoadScript, Marker, Libraries } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CargoMapInfoWindow from "@/components/cargo/CargoMapInfoWindow";
import { Carga, Filters, SelectedCarga } from "@/types/mapa-cargas";
import { useMemo } from "react";

interface CargasMapaProps {
  filters: Filters;
}

const CargasMapa = ({ filters }: CargasMapaProps) => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarga, setSelectedCarga] = useState<SelectedCarga | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const { toast } = useToast();

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const center = {
    lat: -34.0,
    lng: -64.0,
  };

  const libraries: Libraries = useMemo(() => ["places"], []);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  // Function to recenter map if needed
  const adjustMapForSelectedCarga = useCallback(() => {
    if (selectedCarga && mapInstance) {
      const position = selectedCarga.tipo === "origen" 
        ? { lat: selectedCarga.carga.origen_lat || 0, lng: selectedCarga.carga.origen_lng || 0 }
        : { lat: selectedCarga.carga.destino_lat || 0, lng: selectedCarga.carga.destino_lng || 0 };
      
      mapInstance.panTo(position);
    }
  }, [selectedCarga, mapInstance]);

  useEffect(() => {
    adjustMapForSelectedCarga();
  }, [selectedCarga, adjustMapForSelectedCarga]);

  useEffect(() => {
    const fetchCargas = async () => {
      try {
        let query = supabase
          .from("cargas")
          .select("*")
          .eq("estado", "disponible");

        if (filters.provinciaOrigen) {
          query = query.ilike("origen_provincia", `%${filters.provinciaOrigen}%`);
        }
        if (filters.provinciaDestino) {
          query = query.ilike("destino_provincia", `%${filters.provinciaDestino}%`);
        }
        if (filters.tipoCamion) {
          query = query.eq("tipo_camion", filters.tipoCamion);
        }

        const { data, error } = await query;

        if (error) throw error;

        console.log("Cargas fetched:", data);
        // Cast data to Carga[] to ensure type compatibility
        setCargas(data as unknown as Carga[]);
      } catch (error: any) {
        console.error("Error fetching cargas:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las ubicaciones de las cargas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCargas();
  }, [toast, filters]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        Cargando mapa...
      </div>
    );
  }

  // Get marker options function
  const getMarkerOptions = (isOrigin: boolean) => ({
    icon: {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: isOrigin ? "#22c55e" : "#ef4444",
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: isOrigin ? "#166534" : "#991b1b",
      scale: 2,
    },
  });

  return (
    <LoadScript 
      googleMapsApiKey="AIzaSyD8ns70mGT3vZSmWPw7YOIduUiqB5RAl8g"
      libraries={libraries}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={4}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
        onLoad={onLoad}
      >
        {cargas.map((carga) => (
          <div key={carga.id}>
            {carga.origen_lat && carga.origen_lng && (
              <Marker
                position={{
                  lat: carga.origen_lat,
                  lng: carga.origen_lng,
                }}
                onClick={() =>
                  setSelectedCarga({ carga, tipo: "origen" })
                }
                options={getMarkerOptions(true)}
              />
            )}
            {carga.destino_lat && carga.destino_lng && (
              <Marker
                position={{
                  lat: carga.destino_lat,
                  lng: carga.destino_lng,
                }}
                onClick={() =>
                  setSelectedCarga({ carga, tipo: "destino" })
                }
                options={getMarkerOptions(false)}
              />
            )}
          </div>
        ))}
        {selectedCarga && (
          <InfoWindow
            position={
              selectedCarga.tipo === "origen"
                ? {
                    lat: selectedCarga.carga.origen_lat || 0,
                    lng: selectedCarga.carga.origen_lng || 0,
                  }
                : {
                    lat: selectedCarga.carga.destino_lat || 0,
                    lng: selectedCarga.carga.destino_lng || 0,
                  }
            }
            onCloseClick={() => setSelectedCarga(null)}
          >
            <CargoMapInfoWindow
              cargaId={selectedCarga.carga.id}
              tipo={selectedCarga.tipo}
              lugar={
                selectedCarga.tipo === "origen"
                  ? selectedCarga.carga.origen
                  : selectedCarga.carga.destino
              }
              detalle={
                selectedCarga.tipo === "origen"
                  ? selectedCarga.carga.origen_detalle
                  : selectedCarga.carga.destino_detalle
              }
              provincia={
                selectedCarga.tipo === "origen"
                  ? selectedCarga.carga.origen_provincia
                  : selectedCarga.carga.destino_provincia
              }
              ciudad={
                selectedCarga.tipo === "origen"
                  ? selectedCarga.carga.origen_ciudad
                  : selectedCarga.carga.destino_ciudad
              }
              tipoCarga={selectedCarga.carga.tipo_carga}
              tipoCamion={selectedCarga.carga.tipo_camion}
              fechaCargaDesde={selectedCarga.carga.fecha_carga_desde}
              fechaCargaHasta={selectedCarga.carga.fecha_carga_hasta}
              tarifa={selectedCarga.carga.tarifa}
              observaciones={selectedCarga.carga.observaciones}
              onClose={() => setSelectedCarga(null)}
            />
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default CargasMapa;
