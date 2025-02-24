
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { GoogleMap, InfoWindow, LoadScript, Marker } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CargoMapFilters from "@/components/cargo/CargoMapFilters";
import CargoMapInfoWindow from "@/components/cargo/CargoMapInfoWindow";

interface Carga {
  id: string;
  origen: string;
  destino: string;
  origen_lat: number;
  origen_lng: number;
  destino_lat: number;
  destino_lng: number;
  origen_detalle: string | null;
  destino_detalle: string | null;
  tipo_carga: string;
  tipo_camion: string;
  fecha_carga_desde: string;
  fecha_carga_hasta: string | null;
  tarifa: number;
  observaciones: string | null;
}

interface Filters {
  provinciaOrigen?: string;
  provinciaDestino?: string;
  tipoCamion?: string;
}

const MapaCargas = () => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarga, setSelectedCarga] = useState<{
    carga: Carga;
    tipo: "origen" | "destino";
  } | null>(null);
  const [filters, setFilters] = useState<Filters>({});
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

  const handleFilterChange = (newFilters: Filters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="h-[calc(100vh-8rem)]">
            <div className="w-full h-full flex items-center justify-center">
              Cargando mapa...
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="h-[calc(100vh-8rem)] relative">
          <div className="absolute top-4 right-4 z-10">
            <CargoMapFilters onFilterChange={handleFilterChange} />
          </div>
          <LoadScript googleMapsApiKey="AIzaSyD8ns70mGT3vZSmWPw7YOIduUiqB5RAl8g">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={4}
            >
              {cargas.map((carga) => (
                <>
                  {carga.origen_lat && carga.origen_lng && (
                    <Marker
                      key={`origen-${carga.id}`}
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
                      }}
                    />
                  )}
                  {carga.destino_lat && carga.destino_lng && (
                    <Marker
                      key={`destino-${carga.id}`}
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
                      }}
                    />
                  )}
                </>
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
        </Card>
      </div>
    </div>
  );
};

export default MapaCargas;
