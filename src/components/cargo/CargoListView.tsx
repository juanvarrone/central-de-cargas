import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Truck, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Carga, Filters } from "@/types/mapa-cargas";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { applyDateFilter, buildVisibilityQuery } from "@/utils/dataValidation";

interface CargoListViewProps {
  filters: Filters;
}

interface CargaWithPostulaciones extends Carga {
  postulaciones_count?: number;
}

const CargoListView = ({ filters }: CargoListViewProps) => {
  const [cargas, setCargas] = useState<CargaWithPostulaciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [revisarTarifaStates, setRevisarTarifaStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [currentCargaId, setCurrentCargaId] = useState<string | null>(null);
  const { config: systemConfig, loading: configLoading } = useSystemConfig();

  useEffect(() => {
    const fetchCargas = async () => {
      try {
        setLoading(true);
        console.log("CargoListView: Fetching cargas with filters:", filters);
        console.log("CargoListView: System config:", systemConfig);
        
        let query = supabase
          .from("cargas")
          .select("*")
          .eq("estado", "disponible");

        // Apply basic filters first
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
        console.log("CargoListView: Using extra days for cargas:", extraDays);

        // Apply visibility filter with safer approach
        try {
          query = buildVisibilityQuery(query, "fecha_carga_hasta", extraDays);
        } catch (queryError) {
          console.warn("CargoListView: Error building visibility query, using basic query:", queryError);
          // Fallback: just get available cargas without complex date filtering
        }

        const { data, error } = await query;

        if (error) {
          console.error("CargoListView: Supabase query error:", error);
          throw error;
        }

        console.log("CargoListView: Raw cargas data:", data);

        if (!data) {
          setCargas([]);
          return;
        }

        // Apply additional client-side filtering for robustness
        let filteredData = applyDateFilter(data, "fecha_carga_hasta", extraDays);

        // Fetch postulaciones count separately to avoid relationship conflicts
        const cargasWithPostulaciones = await Promise.all(
          filteredData.map(async (carga: any) => {
            try {
              const { count } = await supabase
                .from("cargas_postulaciones")
                .select("*", { count: "exact", head: true })
                .eq("carga_id", carga.id);
              
              return {
                ...carga,
                postulaciones_count: count || 0
              };
            } catch (countError) {
              console.warn("CargoListView: Error fetching postulaciones count for carga:", carga.id, countError);
              return {
                ...carga,
                postulaciones_count: 0
              };
            }
          })
        );

        console.log("CargoListView: Processed cargas data:", cargasWithPostulaciones);
        setCargas(cargasWithPostulaciones as CargaWithPostulaciones[]);
      } catch (error: any) {
        console.error("CargoListView: Error fetching cargas:", error);
        toast({
          title: "Error",
          description: `No se pudieron cargar las cargas: ${error.message || 'Error desconocido'}`,
          variant: "destructive",
        });
        // Set empty array on error to avoid infinite loading
        setCargas([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when config is loaded or after a reasonable timeout
    if (!configLoading) {
      fetchCargas();
    }
  }, [filters, systemConfig, configLoading, toast]);

  const getTipoTarifaLabel = (tipo: string) => {
    switch (tipo) {
      case 'por_viaje':
        return 'por viaje';
      case 'por_tonelada':
        return 'por tn';
      default:
        return '';
    }
  };

  const calculateCostPerKm = (tarifa: number) => {
    // This is a simplified calculation - estimated 800km average distance for demonstration
    // In a real app you'd need the actual distance calculation
    const estimatedDistance = 800; // km
    const costPerKm = tarifa / estimatedDistance;
    return costPerKm.toFixed(2);
  };

  const formatLocation = (ciudad?: string, provincia?: string) => {
    const parts = [];
    if (ciudad) parts.push(ciudad);
    if (provincia) parts.push(provincia);
    return parts.join(", ") || "Sin detalles";
  };

  const handleRevisarTarifaChange = (cargaId: string, checked: boolean) => {
    setRevisarTarifaStates(prev => ({
      ...prev,
      [cargaId]: checked
    }));
  };

  const handlePostularse = async (cargaId: string) => {
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setCurrentCargaId(cargaId);
        setShowLoginDialog(true);
        return;
      }

      const userId = session.user.id;
      const revisarTarifa = revisarTarifaStates[cargaId] || false;
      
      // Check if user has already applied to this load using raw query
      const { data: existingApplication, error: checkError } = await supabase
        .from('cargas_postulaciones')
        .select("*")
        .eq("carga_id", cargaId)
        .eq("usuario_id", userId)
        .single();
      
      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }
      
      if (existingApplication) {
        toast({
          title: "Ya te has postulado",
          description: "Ya te has postulado a esta carga anteriormente",
        });
        return;
      }
      
      // Create a new application using raw insert
      const { error } = await supabase
        .from('cargas_postulaciones')
        .insert({
          carga_id: cargaId,
          usuario_id: userId,
          estado: "pendiente",
          revisar_tarifa: revisarTarifa
        } as any);

      if (error) throw error;

      toast({
        title: "Postulación exitosa",
        description: "Te has postulado a la carga exitosamente",
      });

      // Reset the checkbox state after successful application
      setRevisarTarifaStates(prev => ({
        ...prev,
        [cargaId]: false
      }));
    } catch (error: any) {
      console.error("Error al postularse:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar tu postulación",
        variant: "destructive",
      });
    }
  };

  const handleLoginRedirect = () => {
    if (currentCargaId) {
      navigate("/auth", { state: { from: `/ver-carga/${currentCargaId}` } });
    } else {
      navigate("/auth", { state: { from: "/buscar-cargas" } });
    }
  };

  if (loading || configLoading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (cargas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No hay cargas disponibles con los filtros actuales</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {cargas.map((carga) => (
          <div key={carga.id} className="border rounded-md p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_auto] gap-4 items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Origen: {formatLocation(carga.origen_ciudad, carga.origen_provincia)}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium">Destino: {formatLocation(carga.destino_ciudad, carga.destino_provincia)}</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-primary" />
                  <span className="text-sm">{carga.tipo_camion}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Carga:</span> {carga.tipo_carga}
                </div>
                <div className="text-sm font-semibold">
                  ${new Intl.NumberFormat("es-AR").format(carga.tarifa)}
                  <span className="ml-1 text-xs text-gray-500">
                    ({getTipoTarifaLabel(carga.tipo_tarifa)})
                  </span>
                  {carga.tarifa_aproximada && (
                    <span className="ml-1 text-xs text-gray-500">(aprox.)</span>
                  )}
                </div>
                {carga.tipo_tarifa === 'por_viaje' && (
                  <div className="text-xs text-blue-600">
                    ~${calculateCostPerKm(carga.tarifa)}/km
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {carga.postulaciones_count || 0} postulaciones
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate(`/ver-carga/${carga.id}`)}>
                  Ver detalle
                </Button>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                      id={`revisar-tarifa-${carga.id}`}
                      checked={revisarTarifaStates[carga.id] || false}
                      onCheckedChange={(checked) => handleRevisarTarifaChange(carga.id, checked === true)}
                      className="w-3 h-3"
                    />
                    <label 
                      htmlFor={`revisar-tarifa-${carga.id}`}
                      className="text-xs leading-none"
                    >
                      Revisar tarifa
                    </label>
                  </div>
                  <Button size="sm" onClick={() => handlePostularse(carga.id)}>
                    Postularse
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar sesión requerido</DialogTitle>
            <DialogDescription>
              Para postularte a esta carga, primero debes iniciar sesión.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLoginRedirect}>
              Iniciar sesión
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CargoListView;
