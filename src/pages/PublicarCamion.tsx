
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck } from "lucide-react";
import { TruckFormData } from "@/types/truck";
import { useTruckSubmission } from "@/hooks/useTruckSubmission";

const PublicarCamion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { 
    canPublishCamion, 
    user, 
    isLoading: authLoading 
  } = useAuth();
  const { submitTruck } = useTruckSubmission();
  const [formData, setFormData] = useState<TruckFormData>({
    origen_provincia: '',
    destino_provincia: '',
    tipo_camion: '',
    capacidad: '',
    refrigerado: false,
    fecha_disponible_desde: '',
    radio_km: 50
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          toast({
            title: "Acceso restringido",
            description: "Debe iniciar sesión para acceder a esta página",
            variant: "destructive",
          });
          navigate("/auth", { state: { from: "/publicar-camion" } });
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    if (!loading && !authLoading && user && !canPublishCamion) {
      toast({
        title: "Acceso restringido",
        description: "No tienes permisos para publicar disponibilidad de camiones. Esta funcionalidad es solo para Transportistas y Administradores.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [canPublishCamion, loading, authLoading, user, navigate, toast]);

  const handleSubmit = async (data: TruckFormData) => {
    try {
      setLoading(true);
      await submitTruck(data);
      toast({
        title: "Disponibilidad publicada",
        description: "Tu disponibilidad de camión ha sido publicada exitosamente",
      });
      navigate("/mis-camiones");
    } catch (error: any) {
      console.error("Error submitting truck:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar la disponibilidad del camión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
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
        <h1 className="text-3xl font-bold">Publicar Disponibilidad de Camión</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2 h-6 w-6" />
            Registrar disponibilidad de transporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Complete el formulario para publicar la disponibilidad de su camión y permitir que dadores de carga puedan contactarlo.
          </p>
          
          {/* Aquí iría el formulario para los datos del camión */}
          {/* Por ahora implementamos solo la estructura base */}
          
          <div className="mt-6">
            <Button 
              onClick={() => handleSubmit(formData)} 
              disabled={loading}
              className="w-full md:w-auto"
            >
              Publicar disponibilidad
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicarCamion;
