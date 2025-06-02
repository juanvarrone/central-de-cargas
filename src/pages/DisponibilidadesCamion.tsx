
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, Radius, Trash2, Loader2, AlertOctagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface Disponibilidad {
  id: string;
  origen: string;
  origen_provincia: string;
  origen_ciudad: string | null;
  fecha_disponible_desde: string | null;
  fecha_disponible_hasta: string | null;
  radio_km: number;
  estado: string;
  created_at: string;
  observaciones: string | null;
  es_permanente: boolean;
}

interface Truck {
  id: string;
  tipo_camion: string;
  capacidad: string;
  patente_chasis: string;
  refrigerado: boolean;
}

const DisponibilidadesCamion = () => {
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidad[]>([]);
  const [truck, setTruck] = useState<Truck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { truckId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!truckId) {
          throw new Error("ID de camión no válido");
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        // Fetch truck details
        const { data: truckData, error: truckError } = await supabase
          .from("trucks")
          .select("id, tipo_camion, capacidad, patente_chasis, refrigerado")
          .eq("id", truckId)
          .eq("user_id", user.id)
          .single();

        if (truckError) throw truckError;
        setTruck(truckData);

        // Fetch disponibilidades for this truck
        const { data: disponibilidadesData, error: disponibilidadesError } = await supabase
          .from("camiones_disponibles")
          .select(`
            id,
            origen,
            origen_provincia,
            origen_ciudad,
            fecha_disponible_desde,
            fecha_disponible_hasta,
            radio_km,
            estado,
            created_at,
            observaciones,
            es_permanente
          `)
          .eq("usuario_id", user.id)
          .order("created_at", { ascending: false });

        if (disponibilidadesError) throw disponibilidadesError;

        setDisponibilidades(disponibilidadesData || []);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [truckId, navigate]);

  const handleDeleteDisponibilidad = async (disponibilidadId: string) => {
    try {
      const { error } = await supabase
        .from("camiones_disponibles")
        .delete()
        .eq("id", disponibilidadId);

      if (error) throw error;

      setDisponibilidades(prev => prev.filter(d => d.id !== disponibilidadId));
      toast({
        title: "Disponibilidad eliminada",
        description: "La disponibilidad ha sido eliminada correctamente"
      });
    } catch (err: any) {
      console.error("Error deleting disponibilidad:", err);
      toast({
        title: "Error",
        description: err.message || "Error al eliminar la disponibilidad",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Permanente";
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
      case 'ocupado':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'inactivo':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !truck) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertOctagon className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-center text-red-500 font-medium mb-2">Error al cargar los datos</p>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => navigate("/mis-camiones")}>
              Volver a mis camiones
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/mis-camiones")} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Disponibilidades Publicadas</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">{truck.tipo_camion}</Badge>
            {truck.refrigerado && (
              <Badge className="bg-blue-500 hover:bg-blue-600">Refrigerado</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium">Patente</p>
              <p className="text-muted-foreground">{truck.patente_chasis}</p>
            </div>
            <div>
              <p className="font-medium">Capacidad</p>
              <p className="text-muted-foreground">{truck.capacidad}</p>
            </div>
            <div>
              <p className="font-medium">Disponibilidades</p>
              <p className="text-muted-foreground">{disponibilidades.length} publicaciones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {disponibilidades.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">No hay disponibilidades publicadas</h2>
            <p className="text-muted-foreground mb-6">
              Aún no has publicado disponibilidades para este camión.
            </p>
            <Button onClick={() => navigate("/publicar-camion")}>
              Publicar disponibilidad
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {disponibilidades.map((disponibilidad) => (
            <Card key={disponibilidad.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getEstadoBadgeColor(disponibilidad.estado)}>
                        {disponibilidad.estado.charAt(0).toUpperCase() + disponibilidad.estado.slice(1)}
                      </Badge>
                      {disponibilidad.es_permanente && (
                        <Badge variant="outline">Permanente</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <MapPin className="h-4 w-4" />
                      {disponibilidad.origen_provincia}
                      {disponibilidad.origen_ciudad && `, ${disponibilidad.origen_ciudad}`}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Radius className="h-4 w-4" />
                        Radio: {disponibilidad.radio_km} km
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {disponibilidad.es_permanente ? (
                          "Disponibilidad permanente"
                        ) : (
                          `${formatDate(disponibilidad.fecha_disponible_desde)} - ${formatDate(disponibilidad.fecha_disponible_hasta)}`
                        )}
                      </div>
                    </div>
                    
                    {disponibilidad.observaciones && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Observaciones:</strong> {disponibilidad.observaciones}
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Publicado: {formatDate(disponibilidad.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 md:flex-col">
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
                            Esta acción no se puede deshacer. Se eliminará permanentemente esta disponibilidad.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteDisponibilidad(disponibilidad.id)}
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

export default DisponibilidadesCamion;
