
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
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Phone, 
  Star, 
  AlertCircle, 
  ChevronDown,
  ChevronUp,
  Truck 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

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
    user_type: string;
  };
  camiones?: {
    id: string;
    tipo_camion: string;
    capacidad: string;
    refrigerado: boolean;
  }[];
};

interface CargaPostulacionesProps {
  cargaId: string;
  isLoading: boolean;
}

const CargaPostulaciones = ({ cargaId, isLoading: parentLoading }: CargaPostulacionesProps) => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedPostulacion, setSelectedPostulacion] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const visiblePostulaciones = showAll ? postulaciones : postulaciones.slice(0, 5);
  const hasMore = postulaciones.length > 5;

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
              avg_overall_rating,
              user_type
            )
          `)
          .eq("carga_id", cargaId);

        if (error) throw error;
        
        // Fetch truck information for each user
        const postulacionesWithTrucks = await Promise.all(
          (data as unknown as Postulacion[]).map(async (postulacion) => {
            const { data: camiones, error: trucksError } = await supabase
              .from('trucks')
              .select('id, tipo_camion, capacidad, refrigerado')
              .eq('user_id', postulacion.usuario_id);
              
            if (trucksError) {
              console.error('Error fetching trucks:', trucksError);
              return postulacion;
            }
            
            return { ...postulacion, camiones };
          })
        );
        
        setPostulaciones(postulacionesWithTrucks as Postulacion[]);
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

  const handleAssignCarga = async (postulacionId: string) => {
    try {
      const { error: updateError } = await supabase
        .from("cargas")
        .update({ 
          postulacion_asignada_id: postulacionId,
          fecha_asignacion: new Date().toISOString(),
          estado: "asignada"
        })
        .eq("id", cargaId);
        
      if (updateError) throw updateError;
      
      // Update the postulación status
      const { error: postulacionError } = await supabase
        .from("cargas_postulaciones")
        .update({ estado: "aceptada" })
        .eq("id", postulacionId);
        
      if (postulacionError) throw postulacionError;
      
      // Update local state
      setPostulaciones(postulaciones.map(p => 
        p.id === postulacionId 
          ? { ...p, estado: "aceptada" } 
          : p
      ));
      
      toast({
        title: "Carga asignada",
        description: "Has asignado la carga exitosamente",
      });
      
      setConfirmDialogOpen(false);
      
      // Refresh the page after successful assignment
      setTimeout(() => {
        navigate(0);
      }, 1500);
      
    } catch (error: any) {
      console.error("Error assigning carga:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar la carga",
        variant: "destructive",
      });
    }
  };

  const confirmAssign = (postulacionId: string) => {
    setSelectedPostulacion(postulacionId);
    setConfirmDialogOpen(true);
  };

  if (loading || parentLoading) {
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
            <TableHead>Camiones</TableHead>
            <TableHead>Calificación</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Revisión</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visiblePostulaciones.map((postulacion) => (
            <TableRow key={postulacion.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User size={18} className="text-gray-500" />
                  <div>
                    <div>{postulacion.usuario.full_name || "Usuario"}</div>
                    {postulacion.usuario.phone_number && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Phone size={14} />
                        <span>{postulacion.usuario.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {postulacion.camiones && postulacion.camiones.length > 0 ? (
                  <div className="space-y-1">
                    {postulacion.camiones.map((camion, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-sm">
                        <Truck size={14} className="text-primary shrink-0" />
                        <span className="font-medium">{camion.tipo_camion}</span>
                        <span className="text-xs text-muted-foreground">({camion.capacidad})</span>
                        {camion.refrigerado && (
                          <Badge variant="outline" className="ml-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Refri
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Sin datos</span>
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
                    <Button 
                      size="sm" 
                      onClick={() => confirmAssign(postulacion.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 size={16} className="mr-1" /> Asignar
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {hasMore && (
        <div className="flex justify-center mt-3">
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1"
          >
            {showAll ? (
              <>
                <ChevronUp size={16} /> Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown size={16} /> Ver todas ({postulaciones.length})
              </>
            )}
          </Button>
        </div>
      )}

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar asignación de carga</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas asignar esta carga al transportista seleccionado? 
              Esta acción cambiará el estado de la carga a "asignada" y notificará al transportista.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedPostulacion && handleAssignCarga(selectedPostulacion)}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar asignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CargaPostulaciones;
