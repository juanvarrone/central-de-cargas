
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

const CargoListView = ({ filters }: CargoListViewProps) => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [revisarTarifa, setRevisarTarifa] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [currentCargaId, setCurrentCargaId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCargas = async () => {
      try {
        setLoading(true);
        
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

        // Cast data to Carga[] to ensure type compatibility
        setCargas(data as unknown as Carga[]);
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
                  <span className="font-medium">{carga.origen}</span>
                </div>
                <p className="text-sm text-gray-500 ml-5">
                  {carga.origen_ciudad && carga.origen_provincia
                    ? `${carga.origen_ciudad}, ${carga.origen_provincia}`
                    : "Sin detalles de ubicación"}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium">{carga.destino}</span>
                </div>
                <p className="text-sm text-gray-500 ml-5">
                  {carga.destino_ciudad && carga.destino_provincia
                    ? `${carga.destino_ciudad}, ${carga.destino_provincia}`
                    : "Sin detalles de ubicación"}
                </p>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-primary" />
                  <span>{carga.tipo_camion}</span>
                </div>
                <div className="text-sm font-semibold">
                  ${new Intl.NumberFormat("es-AR").format(carga.tarifa)}
                  {carga.tarifa_aproximada && (
                    <span className="ml-1 text-xs text-gray-500">(aprox.)</span>
                  )}
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
                      checked={revisarTarifa} 
                      onCheckedChange={(checked) => setRevisarTarifa(checked === true)}
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
