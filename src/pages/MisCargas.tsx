
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, Eye, CheckCircle } from "lucide-react";
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

interface Carga {
  id: string;
  tipo_carga: string;
  origen: string;
  destino: string;
  fecha_carga_desde: string;
  estado: string;
  created_at: string;
  postulaciones?: number;
  postulacion_asignada_id?: string | null;
  transportista?: {
    full_name: string;
    phone_number: string;
    id: string;
  } | null;
}

const MisCargas = () => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [cargaToCancel, setCargaToCancel] = useState<string | null>(null);
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
      
      // Get cargas with postulaciones count
      const { data: cargasData, error } = await supabase
        .from("cargas")
        .select("*, postulaciones:cargas_postulaciones(count)")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to extract the count
      const cargasWithCounts = (cargasData || []).map((carga: any) => ({
        ...carga,
        postulaciones: carga.postulaciones?.[0]?.count || 0
      }));
      
      // For cargas with assigned postulaciones, fetch the transportista details
      const cargasWithTransportistas = await Promise.all(
        cargasWithCounts.map(async (carga: Carga) => {
          if (carga.postulacion_asignada_id) {
            try {
              // First get the user_id from the postulacion
              const { data: postulacion, error: postulacionError } = await supabase
                .from("cargas_postulaciones")
                .select("usuario_id")
                .eq("id", carga.postulacion_asignada_id)
                .single();
                
              if (postulacionError) throw postulacionError;
              
              // Then get the transportista details
              const { data: transportista, error: profileError } = await supabase
                .from("profiles")
                .select("full_name, phone_number, id")
                .eq("id", postulacion.usuario_id)
                .single();
                
              if (profileError) throw profileError;
              
              return { ...carga, transportista };
            } catch (error) {
              console.error("Error fetching transportista:", error);
              return carga;
            }
          }
          return carga;
        })
      );
      
      setCargas(cargasWithTransportistas);
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

  const cancelarCarga = async (cargaId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("cargas")
        .update({ estado: "cancelada" })
        .eq("id", cargaId);
      
      if (error) throw error;
      
      // Update the UI
      setCargas((prevCargas) =>
        prevCargas.map((carga) =>
          carga.id === cargaId ? { ...carga, estado: "cancelada" } : carga
        )
      );
      
      toast({
        title: "Carga cancelada",
        description: "La carga ha sido cancelada exitosamente",
      });
      
    } catch (error: any) {
      console.error("Error canceling carga:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la carga",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setCargaToCancel(null);
    }
  };

  const handleEditClick = (cargaId: string) => {
    navigate(`/editar-carga/${cargaId}`);
  };

  const handleViewClick = (cargaId: string) => {
    navigate(`/ver-carga/${cargaId}`);
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'disponible':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'asignada':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
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
                        {carga.estado.charAt(0).toUpperCase() + carga.estado.slice(1)}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-lg">
                      {carga.origen} → {carga.destino}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      <p>Fecha de carga: {formatDate(carga.fecha_carga_desde)}</p>
                      <p>Publicado: {formatDate(carga.created_at)}</p>
                      
                      {/* Mostrar información del transportista asignado si existe */}
                      {carga.transportista && carga.estado === "asignada" && (
                        <div className="mt-2 flex items-center gap-2 text-primary">
                          <CheckCircle size={16} className="fill-green-500 text-white" />
                          <span>Asignada a: <strong>{carga.transportista.full_name}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                    <div className="w-full md:w-auto flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewClick(carga.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditClick(carga.id)}
                        disabled={carga.estado === "cancelada" || carga.estado === "completada" || carga.estado === "asignada"}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={carga.estado === "cancelada" || carga.estado === "completada"}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Cancelar la carga la marcará como no disponible para los transportistas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => cancelarCarga(carga.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Sí, cancelar carga
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
