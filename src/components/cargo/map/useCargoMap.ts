
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Carga, SelectedCarga, Filters } from "@/types/mapa-cargas";

export const useCargoMap = (filters: Filters) => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarga, setSelectedCarga] = useState<SelectedCarga | null>(null);

  const fetchCargas = async () => {
    try {
      setLoading(true);
      
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

      // Extended visibility logic: show cargas until 30 days past their "hasta" date
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      // Filter cargas that are either:
      // 1. Still within their date range (fecha_carga_hasta is null or >= today)
      // 2. Past their date range but within 30 days of expiry
      query = query.or(`fecha_carga_hasta.is.null,fecha_carga_hasta.gte.${now.toISOString()},fecha_carga_hasta.gte.${thirtyDaysAgo.toISOString()}`);

      const { data, error } = await query;

      if (error) throw error;

      // Additional client-side filtering for cargas that are past their "hasta" date
      // but still within 30 days (these should remain visible)
      const filteredData = data?.filter((carga: any) => {
        if (!carga.fecha_carga_hasta) return true; // No end date, always visible
        
        const cargoEndDate = new Date(carga.fecha_carga_hasta);
        const daysDifference = Math.floor((now.getTime() - cargoEndDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Show if within date range or up to 30 days past end date
        return daysDifference <= 30;
      }) || [];

      setCargas(filteredData as Carga[]);
    } catch (error: any) {
      console.error("Error fetching cargas:", error);
      setCargas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargas();
  }, [filters]);

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
