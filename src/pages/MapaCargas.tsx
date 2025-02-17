
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Carga {
  id: string;
  origen: string;
  destino: string;
  origen_lat: number;
  origen_lng: number;
  destino_lat: number;
  destino_lng: number;
}

const MapaCargas = () => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
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
        const { data, error } = await supabase
          .from("cargas")
          .select("*")
          .eq("estado", "disponible");

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
  }, [toast]);

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
        <Card className="h-[calc(100vh-8rem)]">
          <LoadScript googleMapsApiKey="TU_API_KEY_DE_GOOGLE_MAPS">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={4}
            >
              {cargas.map((carga) => (
                carga.origen_lat && carga.origen_lng ? (
                  <Marker
                    key={`origen-${carga.id}`}
                    position={{
                      lat: carga.origen_lat,
                      lng: carga.origen_lng,
                    }}
                    title={`Origen: ${carga.origen}`}
                  />
                ) : null
              ))}
              {cargas.map((carga) => (
                carga.destino_lat && carga.destino_lng ? (
                  <Marker
                    key={`destino-${carga.id}`}
                    position={{
                      lat: carga.destino_lat,
                      lng: carga.destino_lng,
                    }}
                    title={`Destino: ${carga.destino}`}
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    }}
                  />
                ) : null
              ))}
            </GoogleMap>
          </LoadScript>
        </Card>
      </div>
    </div>
  );
};

export default MapaCargas;
