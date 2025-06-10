
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Calendar, Truck, Package, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const EditarCarga = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [carga, setCarga] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        toast({
          title: "Acceso restringido",
          description: "Debe iniciar sesión para editar cargas",
          variant: "destructive",
        });
        navigate("/auth", { state: { from: `/editar-carga/${id}` } });
        return;
      }
      checkCargaAccess();
    };

    checkAuth();
  }, [id, navigate, toast]);

  const checkCargaAccess = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from("cargas")
        .select("*")
        .eq("id", id)
        .eq("usuario_id", user.id)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Acceso denegado",
          description: "No tiene permisos para editar esta carga",
          variant: "destructive",
        });
        navigate("/mis-cargas");
        return;
      }
      
      if (data.estado === "cancelada" || data.estado === "completada") {
        toast({
          title: "Edición no permitida",
          description: `No se puede editar una carga ${data.estado}`,
          variant: "destructive",
        });
        navigate("/mis-cargas");
        return;
      }

      setCarga(data);
      setLoading(false);
    } catch (error: any) {
      console.error("Error checking carga access:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la información de la carga",
        variant: "destructive",
      });
      navigate("/mis-cargas");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="py-12 text-center">Cargando información...</div>
      </div>
    );
  }

  if (!carga) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="py-12 text-center">Carga no encontrada</div>
      </div>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      disponible: "default",
      asignada: "secondary", 
      completada: "outline",
      cancelada: "destructive"
    };
    
    return <Badge variant={variants[estado] || "default"}>{estado.toUpperCase()}</Badge>;
  };

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
        <h1 className="text-2xl font-bold">Ver Carga</h1>
        <div className="ml-4">
          {getEstadoBadge(carga.estado)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información principal */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información de la Carga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Carga</p>
                <p className="font-medium">{carga.tipo_carga}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Camión</p>
                <p className="font-medium">{carga.tipo_camion}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cantidad de Cargas</p>
                <p className="font-medium">{carga.cantidad_cargas}</p>
              </div>
              {carga.observaciones && (
                <div>
                  <p className="text-sm text-muted-foreground">Observaciones</p>
                  <p className="font-medium">{carga.observaciones}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Origen</p>
                <p className="font-medium">{carga.origen}</p>
                {carga.origen_ciudad && carga.origen_provincia && (
                  <p className="text-sm text-muted-foreground">
                    {carga.origen_ciudad}, {carga.origen_provincia}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destino</p>
                <p className="font-medium">{carga.destino}</p>
                {carga.destino_ciudad && carga.destino_provincia && (
                  <p className="text-sm text-muted-foreground">
                    {carga.destino_ciudad}, {carga.destino_provincia}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Carga Desde</p>
                <p className="font-medium">
                  {format(new Date(carga.fecha_carga_desde), "PPP", { locale: es })}
                </p>
              </div>
              {carga.fecha_carga_hasta && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Carga Hasta</p>
                  <p className="font-medium">
                    {format(new Date(carga.fecha_carga_hasta), "PPP", { locale: es })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nueva sección de Tarifa y Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tarifa y Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Tarifa</p>
                <p className="font-medium text-lg">
                  ${carga.tarifa?.toLocaleString()} {carga.tipo_tarifa}
                  {carga.tarifa_aproximada && (
                    <span className="text-sm text-muted-foreground ml-2">(Aproximada)</span>
                  )}
                </p>
              </div>
              {carga.modo_pago && (
                <div>
                  <p className="text-sm text-muted-foreground">Modo de Pago</p>
                  <p className="font-medium">{carga.modo_pago}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mapa */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ubicación en el Mapa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">
                  Mapa con ubicaciones de origen y destino
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/mis-cargas")}>
              Volver a mis cargas
            </Button>
            <Button onClick={() => navigate(`/ver-carga/${id}`)}>
              Ver detalles completos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarCarga;
