
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface Carga {
  id: string;
  tipo_carga: string;
  origen: string;
  destino: string;
  fecha_carga_desde: string;
  fecha_carga_hasta: string | null;
  estado: string;
  created_at: string;
  tarifa: number;
  tipo_camion: string;
  cantidad_cargas: number;
  observaciones: string | null;
  origen_detalle: string | null;
  destino_detalle: string | null;
}

const VerCarga = () => {
  const { id } = useParams();
  const [carga, setCarga] = useState<Carga | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        toast({
          title: "Acceso restringido",
          description: "Debe iniciar sesión para ver los detalles de la carga",
          variant: "destructive",
        });
        navigate("/auth", { state: { from: `/ver-carga/${id}` } });
        return;
      }
      fetchCarga();
    };

    checkAuth();
  }, [id, navigate, toast]);

  const fetchCarga = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cargas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setCarga(data);
    } catch (error: any) {
      console.error("Error fetching carga:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la carga",
        variant: "destructive",
      });
      navigate("/mis-cargas");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No especificada";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Cargando detalles...</h1>
      </div>
    );
  }

  if (!carga) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Carga no encontrada</h1>
        <Button onClick={() => navigate("/mis-cargas")}>Volver a mis cargas</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/mis-cargas")} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a mis cargas
        </Button>
        <h1 className="text-2xl font-bold">Detalles de la Carga</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Información General</CardTitle>
            <Badge className={getEstadoBadgeColor(carga.estado)}>
              {carga.estado}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-lg mb-4">Ruta</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Origen</p>
                  <p className="font-medium">{carga.origen}</p>
                  {carga.origen_detalle && (
                    <p className="text-sm text-muted-foreground">{carga.origen_detalle}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Destino</p>
                  <p className="font-medium">{carga.destino}</p>
                  {carga.destino_detalle && (
                    <p className="text-sm text-muted-foreground">{carga.destino_detalle}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Detalles</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Carga</p>
                  <p>{carga.tipo_carga}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cantidad</p>
                  <p>{carga.cantidad_cargas} unidad(es)</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Camión Requerido</p>
                  <p>{carga.tipo_camion}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Fechas</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Carga Desde</p>
                  <p>{formatDate(carga.fecha_carga_desde)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Carga Hasta</p>
                  <p>{carga.fecha_carga_hasta ? formatDate(carga.fecha_carga_hasta) : "No especificada"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Publicado</p>
                  <p>{formatDate(carga.created_at)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Tarifa</h3>
              <div>
                <p className="text-xl font-bold">{formatCurrency(carga.tarifa)}</p>
                <p className="text-sm text-muted-foreground">Precio total</p>
              </div>

              {carga.observaciones && (
                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-2">Observaciones</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-md border">{carga.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => navigate("/mis-cargas")}>
          Volver a mis cargas
        </Button>
        
        {carga.estado !== "cancelada" && carga.estado !== "completada" && (
          <Button 
            onClick={() => navigate(`/editar-carga/${carga.id}`)}
          >
            Editar esta carga
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerCarga;
