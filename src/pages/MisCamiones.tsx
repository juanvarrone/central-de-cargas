
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Plus, Loader2, AlertOctagon, Pencil, Trash, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface UserTruck {
  id: string;
  tipo_camion: string;
  capacidad: string;
  refrigerado: boolean;
  patente_chasis: string;
  patente_acoplado: string | null;
  foto_chasis: string | null;
  foto_acoplado: string | null;
  created_at: string;
}

const MisCamiones = () => {
  const [trucks, setTrucks] = useState<UserTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserTrucks = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        // Fetch user trucks
        const { data, error } = await supabase
          .from("trucks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setTrucks(data || []);
      } catch (err: any) {
        console.error("Error fetching trucks:", err);
        setError(err.message || "Error al cargar los camiones");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTrucks();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("trucks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTrucks(trucks.filter(truck => truck.id !== id));
      toast({
        title: "Camión eliminado",
        description: "El camión ha sido eliminado correctamente"
      });
    } catch (err: any) {
      console.error("Error deleting truck:", err);
      toast({
        title: "Error",
        description: err.message || "Error al eliminar el camión",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Mis Camiones</h1>
        <Button onClick={() => navigate("/agregar-camion")} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Agregar nuevo camión
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertOctagon className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-center text-red-500 font-medium mb-2">Error al cargar los camiones</p>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : trucks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Truck className="h-16 w-16 text-muted-foreground mb-6" />
            <h2 className="text-xl font-medium mb-2">No tienes camiones registrados</h2>
            <p className="text-center text-muted-foreground mb-6">
              Agrega tu primer camión para poder publicar disponibilidad y recibir cargas
            </p>
            <Button onClick={() => navigate("/agregar-camion")}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar camión
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trucks.map((truck) => (
            <Card key={truck.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {truck.tipo_camion}
                  </CardTitle>
                  {truck.refrigerado && (
                    <Badge className="bg-blue-500 hover:bg-blue-600">Refrigerado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Patente del chasis</p>
                    <p className="text-muted-foreground">{truck.patente_chasis}</p>
                  </div>
                  
                  {truck.patente_acoplado && (
                    <div>
                      <p className="font-medium">Patente del acoplado</p>
                      <p className="text-muted-foreground">{truck.patente_acoplado}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium">Capacidad</p>
                    <p className="text-muted-foreground">{truck.capacidad}</p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/editar-camion/${truck.id}`)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          if (confirm("¿Estás seguro de que deseas eliminar este camión?")) {
                            handleDelete(truck.id);
                          }
                        }}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/disponibilidades-camion/${truck.id}`)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver disponibilidades publicadas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={() => navigate("/publicar-camion")} 
          className="flex items-center"
        >
          <Truck className="mr-2 h-4 w-4" />
          Publicar disponibilidad
        </Button>
      </div>
    </div>
  );
};

export default MisCamiones;
