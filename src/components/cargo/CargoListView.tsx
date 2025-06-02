import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Truck, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Carga, Filters } from "@/types/mapa-cargas";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  useEffect(() => {
    const fetchCargas = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from("cargas")
          .select(`
            *,
            postulaciones_count:cargas_postulaciones(count)
          `)
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

        // Process the postulaciones count and cast data to CargaWithPostulaciones[]
        const processedData = filteredData.map((carga: any) => ({
          ...carga,
          postulaciones_count: Array.isArray(carga.postulaciones_count) ? carga.postulaciones_count.length : 0
        })) as CargaWithPostulaciones[];

        setCargas(processedData);
      } catch (error: any) {
        console.error("Error fetching cargas:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las cargas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCargas();
  }, [filters, toast]);

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

  if (loading) {
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
                <p className="text-sm text-gray-500 ml-5">
                  {carga.origen_detalle || "Sin detalles adicionales"}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium">Destino: {formatLocation(carga.destino_ciudad, carga.destino_provincia)}</span>
                </div>
                <p className="text-sm text-gray-500 ml-5">
                  {carga.destino_detalle || "Sin detalles adicionales"}
                </p>
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
