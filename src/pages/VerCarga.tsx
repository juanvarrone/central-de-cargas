
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Calendar, Truck, Package, DollarSign } from "lucide-react";
import CargaPostulaciones from "@/components/cargo/CargaPostulaciones";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Checkbox } from "@/components/ui/checkbox";
import { Carga } from "@/types/mapa-cargas";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CargoMap from "@/components/CargoMap";

const VerCarga = () => {
  const { id } = useParams();
  const [carga, setCarga] = useState<Carga | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [revisarTarifa, setRevisarTarifa] = useState(false);
  const { canPostulateToCarga } = useAuth();

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
      fetchCarga(data.user.id);
    };

    checkAuth();
  }, [id, navigate, toast]);

  const fetchCarga = async (userId: string) => {
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
      setIsOwner(data.usuario_id === userId);
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
    return format(date, "PPP", { locale: es });
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      disponible: "default",
      asignada: "secondary", 
      completada: "outline",
      cancelada: "destructive"
    };
    
    return <Badge variant={variants[estado] || "default"}>{estado.toUpperCase()}</Badge>;
  };

  const handlePostularse = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para postularte a esta carga",
          variant: "destructive",
        });
        return;
      }

      if (!id) return;
      
      const userId = session.user.id;
      
      const { data: existingApplication, error: checkError } = await supabase
        .from('cargas_postulaciones')
        .select("*")
        .eq("carga_id", id)
        .eq("usuario_id", userId)
        .single();
      
      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }
      
      if (existingApplication) {
        toast({
          title: "Ya te has postulado",
          description: "Ya te has postulado a esta carga anteriormente",
        });
        return;
      }
      
      const { error } = await supabase
        .from('cargas_postulaciones')
        .insert({
          carga_id: id,
          usuario_id: userId,
          estado: "pendiente",
          revisar_tarifa: revisarTarifa
        } as any);

      if (error) throw error;

      toast({
        title: "Postulación exitosa",
        description: "Te has postulado a la carga exitosamente",
      });
    } catch (error: any) {
      console.error("Error al postularse:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar tu postulación",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="py-12 text-center">Cargando detalles...</div>
      </div>
    );
  }

  if (!carga) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="py-12 text-center">Carga no encontrada</div>
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
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
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
                <p className="font-medium">{formatDate(carga.fecha_carga_desde)}</p>
              </div>
              {carga.fecha_carga_hasta && (
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Carga Hasta</p>
                  <p className="font-medium">{formatDate(carga.fecha_carga_hasta)}</p>
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

          {isOwner && (
            <CargaPostulaciones cargaId={carga.id} isLoading={loading} />
          )}
        </div>

        {/* Mapa */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ubicación en el Mapa</CardTitle>
            </CardHeader>
            <CardContent>
              <CargoMap
                origenCoords={carga.origen_lat && carga.origen_lng ? {
                  lat: Number(carga.origen_lat),
                  lng: Number(carga.origen_lng)
                } : null}
                destinoCoords={carga.destino_lat && carga.destino_lng ? {
                  lat: Number(carga.destino_lat),
                  lng: Number(carga.destino_lng)
                } : null}
                onOrigenChange={() => {}}
                onDestinoChange={() => {}}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            {!isOwner && canPostulateToCarga && carga.estado === "disponible" && (
              <div className="ml-auto flex flex-col items-end gap-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="revisar-tarifa" 
                    checked={revisarTarifa} 
                    onCheckedChange={(checked) => setRevisarTarifa(checked === true)}
                  />
                  <label 
                    htmlFor="revisar-tarifa" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Quiero revisar la tarifa con el dador
                  </label>
                </div>
                <Button 
                  onClick={handlePostularse}
                >
                  Postularme a esta carga
                </Button>
              </div>
            )}
            
            {isOwner ? (
              <div className="flex gap-2">
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
            ) : (
              <Button variant="outline" onClick={() => navigate(-1)}>
                Volver
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerCarga;
