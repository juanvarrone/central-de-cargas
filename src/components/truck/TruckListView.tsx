
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThermometerSnowflake, Calendar, Ruler } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TruckAvailability, TruckFilters } from "@/types/truck";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface TruckListViewProps {
  filters: TruckFilters;
}

const TruckListView = ({ filters }: TruckListViewProps) => {
  const [trucks, setTrucks] = useState<TruckAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        setLoading(true);
        
        // Utilizamos una consulta tipada para evitar problemas de tipos
        const { data, error } = await supabase
          .from('camiones_disponibles')
          .select('*')
          .eq('estado', 'disponible');

        if (error) throw error;

        // Validamos los datos antes de asignarlos
        if (data) {
          setTrucks(data as TruckAvailability[]);
        } else {
          setTrucks([]);
        }
      } catch (error: any) {
        console.error("Error fetching trucks:", error);
        // Fallback para desarrollo
        const mockData: TruckAvailability[] = [
          {
            id: "1",
            origen: "Buenos Aires",
            origen_detalle: "Puerto de Buenos Aires",
            origen_provincia: "Buenos Aires",
            origen_ciudad: "CABA",
            origen_lat: -34.6037,
            origen_lng: -58.3816,
            destino: "Córdoba",
            destino_detalle: "Terminal de cargas",
            destino_provincia: "Córdoba",
            destino_ciudad: "Córdoba",
            destino_lat: -31.4201,
            destino_lng: -64.1888,
            fecha_disponible_desde: new Date().toISOString(),
            fecha_disponible_hasta: new Date(Date.now() + 86400000 * 5).toISOString(),
            tipo_camion: "semi",
            capacidad: "30",
            refrigerado: false,
            radio_km: 50,
            observaciones: "Disponible para cargas generales",
            estado: "disponible",
            usuario_id: "1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            origen: "Mendoza",
            origen_detalle: "Zona industrial",
            origen_provincia: "Mendoza",
            origen_ciudad: "Mendoza",
            origen_lat: -32.8908,
            origen_lng: -68.8272,
            destino: "Buenos Aires",
            destino_detalle: "Mercado Central",
            destino_provincia: "Buenos Aires",
            destino_ciudad: "CABA",
            destino_lat: -34.6037,
            destino_lng: -58.3816,
            fecha_disponible_desde: new Date().toISOString(),
            fecha_disponible_hasta: new Date(Date.now() + 86400000 * 3).toISOString(),
            tipo_camion: "acoplado",
            capacidad: "25",
            refrigerado: true,
            radio_km: 100,
            observaciones: "Equipo con frío para cargas perecederas",
            estado: "disponible",
            usuario_id: "2",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];
        setTrucks(mockData);
        toast({
          title: "Info",
          description: "Mostrando datos de ejemplo",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, [filters, toast]);

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (trucks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No hay camiones disponibles con los filtros actuales</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Camiones Disponibles ({trucks.length})</h2>
      <div className="grid grid-cols-1 gap-4">
        {trucks.map((truck) => (
          <div key={truck.id} className="border rounded-md p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_auto] gap-4 items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">{truck.origen}</span>
                </div>
                <p className="text-sm text-gray-500 ml-5">
                  {truck.origen_ciudad && truck.origen_provincia
                    ? `${truck.origen_ciudad}, ${truck.origen_provincia}`
                    : "Sin detalles de ubicación"}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium">{truck.destino}</span>
                </div>
                <p className="text-sm text-gray-500 ml-5">
                  {truck.destino_ciudad && truck.destino_provincia
                    ? `${truck.destino_ciudad}, ${truck.destino_provincia}`
                    : "Sin detalles de ubicación"}
                </p>
              </div>
              
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500" />
                  <span>Disponible {formatDistanceToNow(new Date(truck.fecha_disponible_desde), { 
                    addSuffix: true, locale: es 
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-gray-500" />
                  <span>Radio: {truck.radio_km}km</span>
                </div>
                {truck.refrigerado && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <ThermometerSnowflake size={14} />
                    <span>Refrigerado</span>
                  </div>
                )}
              </div>
              
              <div>
                <Button size="sm">Contactar</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TruckListView;
