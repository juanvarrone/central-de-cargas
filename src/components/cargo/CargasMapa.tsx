
import { useState, useEffect } from "react";
import { GoogleMap, InfoWindow, LoadScript, Marker } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CargoMapInfoWindow from "@/components/cargo/CargoMapInfoWindow";
import { Carga, Filters, SelectedCarga } from "@/types/mapa-cargas";

interface CargasMapaProps {
  filters: Filters;
}

const CargasMapa = ({ filters }: CargasMapaProps) => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarga, setSelectedCarga] = useState<SelectedCarga | null>(null);
  const { toast } = useToast();

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const center = {
    lat: -34.0,
    lng: -64.0,
  };

  useEffect(() => {
    const fetchCargas = async () => {
      try {
        let query = supabase
          .from("cargas")
          .select("*")
          .eq("estado", "disponible");

        if (filters.provinciaOrigen) {
          query = query.ilike("origen", `%${filters.provinciaOrigen}%`);
        }
        if (filters.provinciaDestino) {
          query = query.ilike("destino", `%${filters.provinciaDestino}%`);
        }
        if (filters.tipoCamion) {
          query = query.eq("tipo_camion", filters.tipoCamion);
        }

        const { data, error } = await query;

        if (error) throw error;

        setCargas(data || []);
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

  return (
    <LoadScript googleMapsApiKey="AIzaSyD8ns70mGT3vZSmWPw7YOIduUiqB5RAl8g">
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
                icon={{
                  path: "M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
                  fillColor: "#22c55e",
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: "#166534",
                  scale: 1.5,
                  anchor: window.google && window.google.maps ? new window.google.maps.Point(12, 17) : null,
                }}
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
                icon={{
                  path: "M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
                  fillColor: "#ef4444",
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: "#991b1b",
                  scale: 1.5,
                  anchor: window.google && window.google.maps ? new window.google.maps.Point(12, 17) : null,
                }}
              />
            )}
          </div>
        ))}
        {selectedCarga && (
          <InfoWindow
            position={
              selectedCarga.tipo === "origen"
                ? {
                    lat: selectedCarga.carga.origen_lat,
                    lng: selectedCarga.carga.origen_lng,
                  }
                : {
                    lat: selectedCarga.carga.destino_lat,
                    lng: selectedCarga.carga.destino_lng,
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
