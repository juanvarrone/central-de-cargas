import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const PublicarCamion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { 
    canPublishCamion, 
    user, 
    isLoading: authLoading 
  } = useAuth();

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

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Publicar Disponibilidad de Camión</h1>
      {/* Existing content */}
    </div>
  );
};

export default PublicarCamion;
