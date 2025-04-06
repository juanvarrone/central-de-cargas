import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

const PublicarCamion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { profile, isLoading: profileLoading } = useUserProfile();

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
    // Check if user has the right profile type once profile is loaded
    if (!profileLoading && profile) {
      if (profile.user_type === 'dador') {
        toast({
          title: "Acceso restringido",
          description: "Como perfil Dador de Cargas, no puedes publicar camiones. Esta funcionalidad es solo para Camioneros.",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [profile, profileLoading, navigate, toast]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  // Rest of the component code remains unchanged
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Publicar Disponibilidad de Camión</h1>
      {/* Existing content */}
    </div>
  );
};

export default PublicarCamion;
