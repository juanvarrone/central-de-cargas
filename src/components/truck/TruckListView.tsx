
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Truck, Calendar, MapPin, Phone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TruckFilters } from "@/types/truck"; 
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface TruckListViewProps {
  filters: TruckFilters;
}

interface TruckData {
  id: string;
  origen: string;
  destino: string;
  origen_provincia?: string;
  destino_provincia?: string;
  origen_ciudad?: string;
  destino_ciudad?: string;
  tipo_camion: string;
  capacidad: string;
  fecha_disponible_desde: string;
  fecha_disponible_hasta?: string;
  refrigerado: boolean;
  usuario_id: string;
  usuario?: {
    full_name?: string;
    phone_number?: string;
  };
}

const TruckListView = ({ filters }: TruckListViewProps) => {
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<TruckData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchTrucks();
  }, [filters]);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("camiones_disponibles")
        .select(`
          *,
          usuario:usuario_id (
            usuario:profiles (
              full_name,
              phone_number
            )
          )
        `)
        .eq("estado", "disponible");

      if (filters.tipoCamion) {
        query = query.eq("tipo_camion", filters.tipoCamion);
      }

      if (filters.refrigerado !== undefined) {
        query = query.eq("refrigerado", filters.refrigerado);
      }

      // Add other filters as needed
      
      const { data, error } = await query;
      
      if (error) throw error;

      // Process data to match the expected structure
      const processedData = data?.map(item => {
        const userData = item.usuario?.usuario?.[0] || {};
        
        return {
          ...item,
          usuario: {
            full_name: userData.full_name,
            phone_number: userData.phone_number
          }
        };
      });
      
      setTrucks(processedData || []);
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

  const handleContact = (truck: TruckData) => {
    if (!isLoggedIn) {
      setLoginDialogOpen(true);
    } else {
      setSelectedTruck(truck);
      setContactDialogOpen(true);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/auth", { state: { from: "/buscar-camiones" } });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Fecha no válida";
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
              
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-primary" />
                  <span>{truck.tipo_camion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">{formatDate(truck.fecha_disponible_desde)}</span>
                </div>
                {truck.refrigerado && (
                  <Badge className="w-fit mt-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Refrigerado
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleContact(truck)}
                >
                  Contactar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Información de contacto</DialogTitle>
          </DialogHeader>
          {selectedTruck && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b pb-2">
                <Truck className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{selectedTruck.tipo_camion}</p>
                  <p className="text-sm text-gray-500">Capacidad: {selectedTruck.capacidad}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <span>
                  {selectedTruck.usuario?.full_name || "Nombre no disponible"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <span>
                  {selectedTruck.usuario?.phone_number || "Teléfono no disponible"}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar sesión requerido</DialogTitle>
            <DialogDescription>
              Para ver la información de contacto, primero debes iniciar sesión.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setLoginDialogOpen(false)}>
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

export default TruckListView;
