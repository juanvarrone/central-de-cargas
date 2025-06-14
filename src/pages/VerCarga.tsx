import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageCircle } from "lucide-react";
import CargaPostulaciones from "@/components/cargo/CargaPostulaciones";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Checkbox } from "@/components/ui/checkbox";
import { Carga } from "@/types/mapa-cargas";
import { useAuth } from "@/context/AuthContext";

const VerCarga = () => {
  const { id } = useParams();
  const [carga, setCarga] = useState<Carga | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [dadorInfo, setDadorInfo] = useState<any>(null);
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

      // Fetch dador information
      if (data.usuario_id) {
        const { data: dadorData, error: dadorError } = await supabase
          .from("profiles")
          .select("full_name, phone_number")
          .eq("id", data.usuario_id)
          .single();

        if (!dadorError && dadorData) {
          setDadorInfo(dadorData);
        }
      }
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

  const getTipoTarifaLabel = (tipo: string) => {
    switch (tipo) {
      case 'por_viaje':
        return 'por viaje completo';
      case 'por_tonelada':
        return 'por tonelada';
      default:
        return 'no especificado';
    }
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
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Detalles de la Carga</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Información General</CardTitle>
            <Badge className={getEstadoBadgeColor(carga.estado)}>
              {carga.estado.charAt(0).toUpperCase() + carga.estado.slice(1)}
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
                
                {carga.fecha_asignacion && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha de Asignación</p>
                    <p>{formatDate(carga.fecha_asignacion)}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Tarifa</h3>
              <div>
                <p className="text-xl font-bold">
                  {formatCurrency(carga.tarifa)}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({getTipoTarifaLabel(carga.tipo_tarifa)})
                  </span>
                </p>
                {carga.tarifa_aproximada && (
                  <p className="text-sm text-muted-foreground">(tarifa aproximada, a definir)</p>
                )}
                {!carga.tarifa_aproximada && (
                  <p className="text-sm text-muted-foreground">Tarifa fija</p>
                )}
              </div>

              {carga.observaciones && (
                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-2">Observaciones</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded-md border">{carga.observaciones}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información del dador (solo si la carga está asignada y no es el dueño) */}
          {!isOwner && carga.estado === "asignada" && dadorInfo && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border">
              <h3 className="font-medium text-lg mb-4">Contacto del Dador de Carga</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{dadorInfo.full_name || "Dador de carga"}</p>
                  {dadorInfo.phone_number && (
                    <p className="text-sm text-muted-foreground">
                      Teléfono: {dadorInfo.phone_number}
                    </p>
                  )}
                </div>
                {dadorInfo.phone_number && (
                  <Button
                    onClick={() => window.open(`https://wa.me/${formatPhoneForWhatsApp(dadorInfo.phone_number)}`, '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>
          )}

          {isOwner && (
            <div className="mt-8">
              <CargaPostulaciones cargaId={carga.id} isLoading={loading} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
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
  );
};

export default VerCarga;
