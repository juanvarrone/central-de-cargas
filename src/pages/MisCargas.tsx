import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, Edit, Trash2, MapPin, Calendar, Truck, DollarSign } from "lucide-react";
import { User } from "@supabase/supabase-js";
import MisCargasFilters from "@/components/cargo/MisCargasFilters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CopyButton from "@/components/ui/copy-button";

interface Cargo {
  id: string;
  tipo_carga: string;
  origen: string;
  destino: string;
  fecha_carga_desde: string;
  fecha_carga_hasta?: string;
  tipo_camion: string;
  tarifa: number;
  tipo_tarifa: string;
  tarifa_aproximada: boolean;
  modo_pago?: string;
  cantidad_cargas: number;
  observaciones?: string;
  estado: string;
  created_at: string;
  origen_lat?: number;
  origen_lng?: number;
  destino_lat?: number;
  destino_lng?: number;
}

const MisCargas = () => {
  const [cargas, setCargas] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    origen: '',
    destino: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchCargas = async (userId: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cargas")
          .select("*")
          .eq("usuario_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setCargas(data || []);
      } catch (error: any) {
        console.error("Error fetching cargas:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchCargas(session.user.id);
      } else {
        setUser(null);
        setCargas([]);
      }
    });
  }, [navigate, toast]);

  useEffect(() => {
    if (user) {
      fetchCargas(user.id);
    }
  }, [user, navigate, toast]);

  const handleCopyCarga = (carga: Cargo) => {
    // Prepare the data for copying, excluding id and metadata
    const cargoData = {
      tipo_carga: carga.tipo_carga,
      origen: carga.origen,
      destino: carga.destino,
      tipo_camion: carga.tipo_camion,
      tarifa: carga.tarifa,
      tipo_tarifa: carga.tipo_tarifa,
      tarifa_aproximada: carga.tarifa_aproximada,
      modo_pago: carga.modo_pago || '',
      cantidad_cargas: carga.cantidad_cargas,
      observaciones: carga.observaciones || '',
      origen_lat: carga.origen_lat,
      origen_lng: carga.origen_lng,
      destino_lat: carga.destino_lat,
      destino_lng: carga.destino_lng,
      // Set new dates for the copy
      fecha_carga_desde: '',
      fecha_carga_hasta: carga.fecha_carga_hasta || ''
    };

    // Navigate to publish page with pre-filled data
    navigate('/publicar-carga', { 
      state: { 
        defaultValues: cargoData,
        isCopy: true 
      } 
    });
  };

  const handleDeleteCarga = async (cargoId: string) => {
    try {
      const { error } = await supabase
        .from("cargas")
        .delete()
        .eq("id", cargoId);

      if (error) throw error;

      setCargas(prev => prev.filter(c => c.id !== cargoId));
      toast({
        title: "Carga eliminada",
        description: "La carga ha sido eliminada correctamente"
      });
    } catch (err: any) {
      console.error("Error deleting carga:", err);
      toast({
        title: "Error",
        description: err.message || "Error al eliminar la carga",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'disponible':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'asignada':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'completada':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const filteredCargas = cargas.filter(carga => {
    const estadoFilter = filters.estado ? carga.estado === filters.estado : true;
    const fechaDesdeFilter = filters.fechaDesde ? new Date(carga.fecha_carga_desde) >= new Date(filters.fechaDesde) : true;
    const fechaHastaFilter = filters.fechaHasta ? new Date(carga.fecha_carga_desde) <= new Date(filters.fechaHasta) : true;
    const origenFilter = filters.origen ? carga.origen.toLowerCase().includes(filters.origen.toLowerCase()) : true;
    const destinoFilter = filters.destino ? carga.destino.toLowerCase().includes(filters.destino.toLowerCase()) : true;

    return estadoFilter && fechaDesdeFilter && fechaHastaFilter && origenFilter && destinoFilter;
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Cargas</h1>
        <Button onClick={() => navigate("/publicar-carga")}>
          Publicar Nueva Carga
        </Button>
      </div>

      <MisCargasFilters filters={filters} onFiltersChange={setFilters} />

      {filteredCargas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">No hay cargas publicadas</h2>
            <p className="text-muted-foreground mb-6">
              {cargas.length === 0 
                ? "Aún no has publicado ninguna carga."
                : "No se encontraron cargas con los filtros aplicados."
              }
            </p>
            <Button onClick={() => navigate("/publicar-carga")}>
              Publicar mi primera carga
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCargas.map((carga) => (
            <Card key={carga.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getEstadoBadgeColor(carga.estado)}>
                        {carga.estado.charAt(0).toUpperCase() + carga.estado.slice(1)}
                      </Badge>
                      <Badge variant="outline">{carga.tipo_carga}</Badge>
                      <Badge variant="outline">{carga.tipo_camion}</Badge>
                      {carga.cantidad_cargas > 1 && (
                        <Badge variant="secondary">{carga.cantidad_cargas} cargas</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Origen → Destino</p>
                          <p className="text-sm text-muted-foreground">{carga.origen} → {carga.destino}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Fecha de carga</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(carga.fecha_carga_desde)}
                            {carga.fecha_carga_hasta && ` - ${formatDate(carga.fecha_carga_hasta)}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Tarifa</p>
                          <p className="text-sm text-muted-foreground">
                            ${carga.tarifa.toLocaleString()} {carga.tipo_tarifa.replace('_', ' ')}
                            {carga.tarifa_aproximada && " (aprox.)"}
                          </p>
                        </div>
                      </div>
                      
                      {carga.modo_pago && (
                        <div>
                          <p className="font-medium text-sm">Modo de pago</p>
                          <p className="text-sm text-muted-foreground">{carga.modo_pago}</p>
                        </div>
                      )}
                    </div>
                    
                    {carga.observaciones && (
                      <div>
                        <p className="font-medium text-sm">Observaciones</p>
                        <p className="text-sm text-muted-foreground">{carga.observaciones}</p>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Publicado: {formatDate(carga.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate(`/ver-carga/${carga.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    
                    {carga.estado === 'disponible' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/editar-carga/${carga.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    
                    <CopyButton 
                      onCopy={() => handleCopyCarga(carga)}
                      size="sm"
                    />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente esta carga.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteCarga(carga.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCargas;
