
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, User, Phone, Star, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Postulacion = {
  id: string;
  carga_id: string;
  usuario_id: string;
  estado: "pendiente" | "aceptada" | "rechazada" | "pausada" | "cancelada";
  revisar_tarifa: boolean;
  created_at: string;
  updated_at: string;
  usuario: {
    id: string;
    full_name: string;
    phone_number: string;
    avg_overall_rating: number;
  };
};

interface CargaPostulacionesProps {
  cargaId: string;
}

const CargaPostulaciones = ({ cargaId }: CargaPostulacionesProps) => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostulaciones = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('cargas_postulaciones')
          .select(`
            *,
            usuario:usuario_id (
              id, 
              full_name,
              phone_number,
              avg_overall_rating
            )
          `)
          .eq("carga_id", cargaId);

        if (error) throw error;
        setPostulaciones(data as unknown as Postulacion[]);
      } catch (error: any) {
        console.error("Error fetching postulaciones:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las postulaciones",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPostulaciones();
  }, [cargaId, toast]);

  const handleUpdateEstado = async (id: string, estado: "aceptada" | "rechazada") => {
    try {
      const { error } = await supabase
        .from('cargas_postulaciones')
        .update({ estado })
        .eq("id", id);

      if (error) throw error;

      // If accepted, we might want to update the cargo status
      if (estado === "aceptada") {
        const { error: cargoError } = await supabase
          .from("cargas")
          .update({ estado: "asignada" })
          .eq("id", cargaId);
          
        if (cargoError) throw cargoError;
      }

      // Update local state
      setPostulaciones(postulaciones.map(p => 
        p.id === id ? { ...p, estado } : p
      ));

      toast({
        title: estado === "aceptada" ? "Postulación aceptada" : "Postulación rechazada",
        description: estado === "aceptada" 
          ? "Has aceptado esta postulación" 
          : "Has rechazado esta postulación",
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

  if (loading) {
    return <div className="text-center py-4">Cargando postulaciones...</div>;
  }

  if (postulaciones.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Aún no hay postulaciones para esta carga.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Postulaciones ({postulaciones.length})</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transportista</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Calificación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Revisión</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {postulaciones.map((postulacion) => (
            <TableRow key={postulacion.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User size={18} className="text-gray-500" />
                  <span>{postulacion.usuario.full_name || "Usuario"}</span>
                </div>
              </TableCell>
              <TableCell>
                {postulacion.usuario.phone_number ? (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span>{postulacion.usuario.phone_number}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">No disponible</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span>
                    {postulacion.usuario.avg_overall_rating 
                      ? postulacion.usuario.avg_overall_rating.toFixed(1) 
                      : "Sin calif."}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    postulacion.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" :
                    postulacion.estado === "aceptada" ? "bg-green-100 text-green-800" :
                    postulacion.estado === "rechazada" ? "bg-red-100 text-red-800" :
                    postulacion.estado === "pausada" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }
                >
                  {postulacion.estado.charAt(0).toUpperCase() + postulacion.estado.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {postulacion.revisar_tarifa && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertCircle size={16} />
                    <span className="text-sm">Revisar tarifa</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/perfil/${postulacion.usuario_id}`)}
                  >
                    Ver perfil
                  </Button>
                  
                  {postulacion.estado === "pendiente" && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateEstado(postulacion.id, "aceptada")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 size={16} className="mr-1" /> Aceptar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateEstado(postulacion.id, "rechazada")}
                        className="text-red-500"
                      >
                        <XCircle size={16} className="mr-1" /> Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CargaPostulaciones;
