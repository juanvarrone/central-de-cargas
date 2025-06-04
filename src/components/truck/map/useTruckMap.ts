
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TruckFilters } from "@/types/truck";

export interface TruckWithLocation {
  id: string;
  usuario_id: string;
  origen: string;
  origen_ciudad?: string;
  origen_provincia?: string;
  origen_lat?: number;
  origen_lng?: number;
  destino: string;
  destino_ciudad?: string;
  destino_provincia?: string;
  destino_lat?: number;
  destino_lng?: number;
  tipo_camion: string;
  capacidad: string;
  refrigerado: boolean;
  fecha_disponible_desde: string;
  fecha_disponible_hasta?: string;
  es_permanente: boolean;
  profiles?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
  };
}

export interface SelectedTruck {
  truck: TruckWithLocation;
  tipo: "origen" | "destino";
}

export const useTruckMap = (filters: TruckFilters) => {
  const [trucks, setTrucks] = useState<TruckWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTruck, setSelectedTruck] = useState<SelectedTruck | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { toast } = useToast();

  const handleMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from("camiones_disponibles")
          .select(`
            *,
            profiles!camiones_disponibles_usuario_id_fkey (
              id,
              full_name,
              phone_number
            )
          `)
          .eq("estado", "disponible")
          .not("origen_lat", "is", null)
          .not("origen_lng", "is", null);
        
        // Add filters
        if (filters.provinciaOrigen) {
          query = query.ilike("origen_provincia", `%${filters.provinciaOrigen}%`);
        }
        if (filters.provinciaDestino) {
          query = query.ilike("destino_provincia", `%${filters.provinciaDestino}%`);
        }
        if (filters.refrigerado !== undefined) {
          query = query.eq("refrigerado", filters.refrigerado);
        }
        if (filters.fecha) {
          query = query.gte("fecha_disponible_desde", filters.fecha);
        }

        // Filter out expired availabilities
        const now = new Date().toISOString();
        query = query.or(`fecha_disponible_hasta.is.null,fecha_disponible_hasta.gte.${now}`);

        const { data, error } = await query;

        if (error) throw error;
        
        setTrucks(data || []);
      } catch (error: any) {
        console.error("Error fetching trucks for map:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los camiones en el mapa",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, [filters, toast]);

  return {
    trucks,
    loading,
    selectedTruck,
    setSelectedTruck,
    map,
    handleMapLoad,
  };
};
