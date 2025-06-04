
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Truck, MapPin, Calendar, Star, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TruckContactModal from "./TruckContactModal";
import { TruckFilters } from "@/types/truck";
import { useAuth } from "@/context/AuthContext";

interface TruckAvailability {
  id: string;
  usuario_id: string;
  origen: string;
  origen_ciudad?: string;
  origen_provincia?: string;
  destino: string;
  destino_ciudad?: string;
  destino_provincia?: string;
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

interface TruckListViewProps {
  filters: TruckFilters;
}

const TruckListView = ({ filters }: TruckListViewProps) => {
  const [trucks, setTrucks] = useState<TruckAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedTruckUserId, setSelectedTruckUserId] = useState<string | null>(null);
  const [selectedTruckUserData, setSelectedTruckUserData] = useState<{
    full_name: string | null;
    phone_number: string | null;
    user_id: string;
  } | null>(null);
  const [loginRequired, setLoginRequired] = useState(false);
  const { canContactTransportistas } = useAuth();

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
          .eq("estado", "disponible");
        
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
          // Filter by date if specified
          query = query.gte("fecha_disponible_desde", filters.fecha);
        }

        // Filter out expired availabilities - only show current ones
        const now = new Date().toISOString();
        query = query.or(`fecha_disponible_hasta.is.null,fecha_disponible_hasta.gte.${now}`);

        const { data, error } = await query;

        if (error) throw error;
        
        // Type assertion to handle the Supabase response
        setTrucks((data || []) as TruckAvailability[]);
      } catch (error: any) {
        console.error("Error fetching trucks:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los camiones disponibles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrucks();
  }, [filters, toast]);

  const handleContactClick = async (truck: TruckAvailability) => {
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoginRequired(true);
        setShowContactModal(true);
        return;
      }

      // Check permissions
      if (!canContactTransportistas) {
        toast({
          title: "Acceso restringido",
          description: "No tienes permisos para contactar transportistas. Esta funcionalidad es solo para Dadores de Cargas y Administradores.",
          variant: "destructive",
        });
        return;
      }

      setSelectedTruckUserId(truck.usuario_id);
      
      if (truck.profiles) {
        setSelectedTruckUserData({
          full_name: truck.profiles.full_name,
          phone_number: truck.profiles.phone_number,
          user_id: truck.profiles.id
        });
      } else {
        // Fetch user data if not available
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, phone_number, id")
          .eq("id", truck.usuario_id)
          .single();
          
        if (error) throw error;
        
        setSelectedTruckUserData({
          full_name: data.full_name,
          phone_number: data.phone_number,
          user_id: data.id
        });
      }
      
      setLoginRequired(false);
      setShowContactModal(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "No se pudo obtener la información de contacto",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando camiones disponibles...</div>;
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
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-primary" />
                  <span>{truck.tipo_camion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm">
                    {new Date(truck.fecha_disponible_desde).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  {truck.refrigerado && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      Refrigerado
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <Button onClick={() => handleContactClick(truck)} className="w-full">
                  <Phone size={16} className="mr-2" />
                  Contactar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TruckContactModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
        userData={selectedTruckUserData}
        loginRequired={loginRequired}
      />
    </div>
  );
};

export default TruckListView;
