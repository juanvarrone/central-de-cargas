
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TruckFilters } from "@/types/truck";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { processTruckMapData, applyDateFilter, buildVisibilityQuery } from "@/utils/dataValidation";

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
  } | null;
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
  const { config: systemConfig, loading: configLoading } = useSystemConfig();

  const handleMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        setLoading(true);
        console.log("useTruckMap: Fetching trucks with filters:", filters);
        console.log("useTruckMap: System config:", systemConfig);
        
        let query = supabase
          .from("camiones_disponibles")
          .select(`
            *,
            profiles:usuario_id (
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

        // Use fallback value if config is not loaded yet or missing
        const extraDays = systemConfig.camiones_extra_days || 30;
        console.log("useTruckMap: Using extra days for trucks:", extraDays);

        // Apply visibility filter with safer approach
        try {
          query = buildVisibilityQuery(query, "fecha_disponible_hasta", extraDays);
        } catch (queryError) {
          console.warn("useTruckMap: Error building visibility query, using basic query:", queryError);
          // Fallback: just get available trucks without complex date filtering
        }

        const { data, error } = await query;

        if (error) {
          console.error("useTruckMap: Supabase query error:", error);
          throw error;
        }

        console.log("useTruckMap: Raw trucks data:", data);

        if (!data) {
          setTrucks([]);
          return;
        }

        // Apply additional client-side filtering for robustness
        let filteredData = applyDateFilter(data, "fecha_disponible_hasta", extraDays);

        // Process the data to handle potential Supabase query errors
        const processedTrucks = processTruckMapData(filteredData);
        console.log("useTruckMap: Processed trucks data:", processedTrucks);
        setTrucks(processedTrucks as TruckWithLocation[]);
      } catch (error: any) {
        console.error("useTruckMap: Error fetching trucks for map:", error);
        toast({
          title: "Error",
          description: `No se pudieron cargar los camiones en el mapa: ${error.message || 'Error desconocido'}`,
          variant: "destructive",
        });
        // Set empty array on error to avoid infinite loading
        setTrucks([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when config is loaded or after a reasonable timeout
    if (!configLoading) {
      fetchTrucks();
    }
  }, [filters, systemConfig, configLoading, toast]);

  return {
    trucks,
    loading,
    selectedTruck,
    setSelectedTruck,
    map,
    handleMapLoad,
  };
};
