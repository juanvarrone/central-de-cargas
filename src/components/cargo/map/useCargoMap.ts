
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Carga, Filters, SelectedCarga } from '@/types/mapa-cargas';

export const useCargoMap = (filters: Filters) => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCarga, setSelectedCarga] = useState<SelectedCarga | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const { toast } = useToast();

  // Function to recenter map if needed
  const adjustMapForSelectedCarga = () => {
    if (selectedCarga && mapInstance) {
      const position = selectedCarga.tipo === "origen" 
        ? { lat: selectedCarga.carga.origen_lat || 0, lng: selectedCarga.carga.origen_lng || 0 }
        : { lat: selectedCarga.carga.destino_lat || 0, lng: selectedCarga.carga.destino_lng || 0 };
      
      mapInstance.panTo(position);
    }
  };

  useEffect(() => {
    adjustMapForSelectedCarga();
  }, [selectedCarga]);

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
  }, [filters, toast]);

  const handleMapLoad = (map: google.maps.Map) => {
    setMapInstance(map);
  };

  return {
    cargas,
    loading,
    selectedCarga,
    setSelectedCarga,
    handleMapLoad,
  };
};
