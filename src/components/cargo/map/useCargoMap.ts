
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carga, SelectedCarga, Filters } from "@/types/mapa-cargas";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { applyDateFilter, buildVisibilityQuery } from "@/utils/dataValidation";

export const useCargoMap = (filters: Filters) => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarga, setSelectedCarga] = useState<SelectedCarga | null>(null);
  const { config: systemConfig, loading: configLoading } = useSystemConfig();

  const fetchCargas = async () => {
    try {
      setLoading(true);
      console.log("useCargoMap: Fetching cargas with filters:", filters);
      console.log("useCargoMap: System config:", systemConfig);
      
      let query = supabase
        .from("cargas")
        .select("*")
        .eq("estado", "disponible");

      // Apply province filters
      if (filters.provinciaOrigen) {
        query = query.ilike("origen_provincia", `%${filters.provinciaOrigen}%`);
      }
      if (filters.provinciaDestino) {
        query = query.ilike("destino_provincia", `%${filters.provinciaDestino}%`);
      }
      if (filters.tipoCamion) {
        query = query.eq("tipo_camion", filters.tipoCamion);
      }

      // Use fallback value if config is not loaded yet or missing
      const extraDays = systemConfig.cargas_extra_days || 30;
      console.log("useCargoMap: Using extra days for cargas:", extraDays);

      // Apply visibility filter with safer approach
      try {
        query = buildVisibilityQuery(query, "fecha_carga_hasta", extraDays);
      } catch (queryError) {
        console.warn("useCargoMap: Error building visibility query, using basic query:", queryError);
        // Fallback: just get available cargas without complex date filtering
      }

      const { data, error } = await query;

      if (error) {
        console.error("useCargoMap: Supabase query error:", error);
        throw error;
      }

      console.log("useCargoMap: Raw cargas data:", data);

      if (!data) {
        setCargas([]);
        return;
      }

      // Apply additional client-side filtering for robustness
      const filteredData = applyDateFilter(data, "fecha_carga_hasta", extraDays);

      console.log("useCargoMap: Processed cargas data:", filteredData);
      setCargas(filteredData as Carga[]);
    } catch (error: any) {
      console.error("useCargoMap: Error fetching cargas:", error);
      setCargas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when config is loaded or after a reasonable timeout
    if (!configLoading) {
      fetchCargas();
    }
  }, [filters, systemConfig, configLoading]);

  const handleMapLoad = (map: google.maps.Map) => {
    // Map loaded callback
    console.log("Map loaded");
  };

  return {
    cargas,
    loading,
    selectedCarga,
    setSelectedCarga,
    handleMapLoad
  };
};
