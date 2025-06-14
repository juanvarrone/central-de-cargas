
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, X, Eye, MessageCircle } from "lucide-react";
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

interface Postulacion {
  id: string;
  usuario_id: string;
  estado: string;
  revisar_tarifa: boolean;
  created_at: string;
  transportista?: {
    full_name: string;
    phone_number: string;
    avg_overall_rating: number;
    total_reviews: number;
  } | null;
}

interface CargaPostulacionesProps {
  cargaId: string;
  isLoading: boolean;
}

const CargaPostulaciones = ({ cargaId, isLoading }: CargaPostulacionesProps) => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [asignando, setAsignando] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (cargaId && !isLoading) {
      fetchPostulaciones();
    }
  }, [cargaId, isLoading]);

  const fetchPostulaciones = async () => {
    try {
      setLoading(true);
      console.log("Fetching postulaciones for carga:", cargaId);
      
      // Consulta simple para obtener postulaciones
      const { data: postulacionesData, error } = await supabase
        .from("cargas_postulaciones")
        .select("*")
        .eq("carga_id", cargaId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching postulaciones:", error);
        throw error;
      }

      console.log("Postulaciones data:", postulacionesData);

      if (!postulacionesData || postulacionesData.length === 0) {
        setPostulaciones([]);
        return;
      }

      // Obtener información de transportistas por separado
      const postulacionesWithTransportistas = await Promise.all(
        postulacionesData.map(async (postulacion: any) => {
          try {
            const { data: transportistaData, error: transportistaError } = await supabase
              .from("profiles")
              .select("full_name, phone_number, avg_overall_rating, total_reviews")
              .eq("id", postulacion.usuario_id)
              .single();

            if (transportistaError) {
              console.warn("Error fetching transportista data:", transportistaError);
            }

            return {
              ...postulacion,
              transportista: transportistaData || null
            };
          } catch (error) {
            console.error("Error processing postulacion:", error);
            return {
              ...postulacion,
              transportista: null
            };
          }
        })
      );

      setPostulaciones(postulacionesWithTransportistas);
    } catch (error: any) {
      console.error("Error fetching postulaciones:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las postulaciones",
        variant: "destructive",
      });
      setPostulaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const asignarTransportista = async (postulacionId: string) => {
    try {
      setAsignando(postulacionId);
      
      const { error } = await supabase
        .from("cargas")
        .update({ 
          postulacion_asignada_id: postulacionId,
          estado: "asignada",
          fecha_asignacion: new Date().toISOString()
        })
        .eq("id", cargaId);

      if (error) throw error;

      // Actualizar estado de la postulación asignada
      await supabase
        .from("cargas_postulaciones")
        .update({ estado: "asignada" })
        .eq("id", postulacionId);

      // Rechazar otras postulaciones
      await supabase
        .from("cargas_postulaciones")
        .update({ estado: "rechazada" })
        .eq("carga_id", cargaId)
        .neq("id", postulacionId);

      toast({
        title: "Transportista asignado",
        description: "El transportista ha sido asignado exitosamente",
      });

      // Actualizar la lista
      fetchPostulaciones();
    } catch (error: any) {
      console.error("Error asignando transportista:", error);
      toast({
        title: "Error",
        description: "No se pudo asignar el transportista",
        variant: "destructive",
      });
    } finally {
      setAsignando(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    // Add country code if not present (assuming Argentina +54)
    if (!cleanPhone.startsWith('54')) {
      return `54${cleanPhone}`;
    }
    return cleanPhone;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando postulaciones...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Postulaciones ({postulaciones.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {postulaciones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay postulaciones para esta carga todavía.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {postulaciones.map((postulacion) => (
              <div key={postulacion.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {postulacion.transportista?.full_name || "Transportista"}
                      </h4>
                      <Badge 
                        variant={postulacion.estado === "pendiente" ? "outline" : 
                                postulacion.estado === "asignada" ? "default" : "secondary"}
                      >
                        {postulacion.estado.charAt(0).toUpperCase() + postulacion.estado.slice(1)}
                      </Badge>
                    </div>
                    
                    {postulacion.transportista && (
                      <div className="text-sm text-muted-foreground">
                        {postulacion.transportista.phone_number && (
                          <div className="flex items-center gap-2">
                            <p>Teléfono: {postulacion.transportista.phone_number}</p>
                            {postulacion.estado === "asignada" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`https://wa.me/${formatPhoneForWhatsApp(postulacion.transportista!.phone_number)}`, '_blank')}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Button>
                            )}
                          </div>
                        )}
                        {postulacion.transportista.total_reviews > 0 && (
                          <p>
                            Calificación: {postulacion.transportista.avg_overall_rating.toFixed(1)}/5 
                            ({postulacion.transportista.total_reviews} reseñas)
                          </p>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Postulado: {formatDate(postulacion.created_at)}
                    </p>
                    
                    {postulacion.revisar_tarifa && (
                      <Badge variant="outline" className="text-orange-600">
                        Quiere revisar tarifa
                      </Badge>
                    )}
                  </div>
                  
                  {postulacion.estado === "pendiente" && (
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm"
                            disabled={asignando === postulacion.id}
                          >
                            {asignando === postulacion.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
                            Asignar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Asignar transportista?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esto asignará la carga a {postulacion.transportista?.full_name || "este transportista"} 
                              y rechazará automáticamente las demás postulaciones.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => asignarTransportista(postulacion.id)}
                            >
                              Sí, asignar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CargaPostulaciones;
