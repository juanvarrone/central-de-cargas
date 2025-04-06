
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, Eye } from "lucide-react";

interface Carga {
  id: string;
  tipo_carga: string;
  origen: string;
  destino: string;
  fecha_carga_desde: string;
  estado: string;
  created_at: string;
  postulaciones?: number;
}

const MisCargas = () => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        toast({
          title: "Acceso restringido",
          description: "Debe iniciar sesión para ver sus cargas",
          variant: "destructive",
        });
        navigate("/auth", { state: { from: "/mis-cargas" } });
        return;
      }
      fetchCargas();
    };

    checkAuth();
  }, [navigate, toast]);

  const fetchCargas = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from("cargas")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setCargas(data || []);
    } catch (error: any) {
      console.error("Error fetching cargas:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar sus cargas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'disponible':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'completada':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Mis Cargas</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Listado de cargas que has publicado
        </p>
        <Button onClick={() => navigate("/publicar-carga")}>
          Publicar nueva carga
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center">Cargando sus cargas...</div>
      ) : cargas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4">No has publicado ninguna carga todavía.</p>
            <Button onClick={() => navigate("/publicar-carga")}>
              Publicar primera carga
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cargas.map((carga) => (
            <Card key={carga.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{carga.tipo_carga}</Badge>
                      <Badge className={getEstadoBadgeColor(carga.estado)}>
                        {carga.estado}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-lg">
                      {carga.origen} → {carga.destino}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      <p>Fecha de carga: {formatDate(carga.fecha_carga_desde)}</p>
                      <p>Publicado: {formatDate(carga.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                    <div className="w-full md:w-auto flex gap-2 justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/ver-carga/${carga.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                    
                    {typeof carga.postulaciones === 'number' && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 ml-auto mt-2 md:mt-0">
                        {carga.postulaciones} Postulaciones
                      </Badge>
                    )}
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
