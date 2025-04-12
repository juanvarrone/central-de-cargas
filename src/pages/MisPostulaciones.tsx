
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Clock, CheckCircle2, XCircle, PauseCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Postulacion = {
  id: string;
  carga_id: string;
  usuario_id: string;
  estado: "pendiente" | "aceptada" | "rechazada" | "pausada" | "cancelada";
  created_at: string;
  updated_at: string;
  carga: {
    origen: string;
    destino: string;
    origen_provincia: string;
    destino_provincia: string;
    tipo_carga: string;
    tipo_camion: string;
    fecha_carga_desde: string;
    tarifa: number;
  };
};

const MisPostulaciones = () => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Acceso restringido",
          description: "Debes iniciar sesión para ver tus postulaciones",
          variant: "destructive",
        });
        navigate("/auth", { state: { from: "/mis-postulaciones" } });
        return false;
      }
      return true;
    };

    const fetchPostulaciones = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;

        setLoading(true);
        const { data, error } = await supabase
          .from("cargas_postulaciones")
          .select(`
            *,
            carga:carga_id (
              origen, 
              destino, 
              origen_provincia,
              destino_provincia,
              tipo_carga,
              tipo_camion,
              fecha_carga_desde,
              tarifa
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPostulaciones(data as Postulacion[]);
      } catch (error: any) {
        console.error("Error fetching postulaciones:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus postulaciones",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPostulaciones();
  }, [toast, navigate]);

  const handleUpdateEstado = async (id: string, estado: "pausada" | "cancelada") => {
    try {
      const { error } = await supabase
        .from("cargas_postulaciones")
        .update({ estado })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setPostulaciones(postulaciones.map(p => 
        p.id === id ? { ...p, estado } : p
      ));

      toast({
        title: estado === "pausada" ? "Postulación pausada" : "Postulación cancelada",
        description: estado === "pausada" 
          ? "La postulación ha sido pausada exitosamente" 
          : "La postulación ha sido cancelada exitosamente",
      });
    } catch (error: any) {
      console.error("Error updating postulacion:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la postulación",
        variant: "destructive",
      });
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock size={14} className="mr-1" /> Pendiente
        </Badge>;
      case "aceptada":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 size={14} className="mr-1" /> Aceptada
        </Badge>;
      case "rechazada":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <XCircle size={14} className="mr-1" /> Rechazada
        </Badge>;
      case "pausada":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          <PauseCircle size={14} className="mr-1" /> Pausada
        </Badge>;
      case "cancelada":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          <XCircle size={14} className="mr-1" /> Cancelada
        </Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Mis Postulaciones</h1>
        </div>

        {postulaciones.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Sin postulaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No tienes postulaciones activas.</p>
              <Button 
                onClick={() => navigate("/buscar-cargas")} 
                className="mt-4"
              >
                Buscar cargas disponibles
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Tus postulaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origen - Destino</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tarifa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postulaciones.map((postulacion) => (
                    <TableRow key={postulacion.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{postulacion.carga.origen}</p>
                          <p className="text-sm text-muted-foreground">a {postulacion.carga.destino}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{postulacion.carga.tipo_carga}</p>
                          <p className="text-sm text-muted-foreground">{postulacion.carga.tipo_camion}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(postulacion.carga.fecha_carga_desde).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        ${new Intl.NumberFormat("es-AR").format(postulacion.carga.tarifa)}
                      </TableCell>
                      <TableCell>
                        {getEstadoBadge(postulacion.estado)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/ver-carga/${postulacion.carga_id}`)}
                          >
                            Ver
                          </Button>
                          {postulacion.estado === "pendiente" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateEstado(postulacion.id, "pausada")}
                              >
                                Pausar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-500"
                                onClick={() => handleUpdateEstado(postulacion.id, "cancelada")}
                              >
                                Cancelar
                              </Button>
                            </>
                          )}
                          {postulacion.estado === "pausada" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-500"
                              onClick={() => handleUpdateEstado(postulacion.id, "cancelada")}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MisPostulaciones;
