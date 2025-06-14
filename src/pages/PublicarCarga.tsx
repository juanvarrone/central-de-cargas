
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import CargoForm from "@/components/cargo/CargoForm";
import { useCargoSubmission } from "@/hooks/useCargoSubmission";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import CargaMasivaForm from "@/components/cargo/CargaMasivaForm";
import { useUserProfile } from "@/hooks/useUserProfile";

const PublicarCarga = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showCargaMasiva, setShowCargaMasiva] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { submitCargo } = useCargoSubmission();
  const { canPublishCarga, isLoading: contextLoading } = useAuth();
  const { profile } = useUserProfile();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setAuthLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setAuthLoading(false);
      }
    };

    fetchUser();
  }, [navigate, toast]);

  // Redirect if user doesn't have permission to publish loads
  useEffect(() => {
    if (!authLoading && !contextLoading && !canPublishCarga && user) {
      toast({
        title: "Acceso restringido",
        description: "No tienes permisos para publicar cargas. Esta funcionalidad es solo para Dadores de Cargas y Administradores.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [canPublishCarga, authLoading, contextLoading, user, navigate, toast]);

  const handleSubmit = async (data: any) => {
    // Check authentication when user submits the form
    if (!user) {
      toast({
        title: "Inicio de sesión requerido",
        description: "Para publicar una carga, debes iniciar sesión primero",
        variant: "destructive",
      });
      navigate('/auth', { 
        state: { from: '/publicar-carga', formData: data },
        replace: true 
      });
      return;
    }

    // Extra safety check (should be caught by the redirect above)
    if (!canPublishCarga) {
      toast({
        title: "Acceso restringido",
        description: "No tienes permisos para publicar cargas.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await submitCargo(data);
      toast({
        title: "Carga publicada",
        description: "Tu carga ha sido publicada exitosamente",
      });
      navigate("/mis-cargas");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCargaMasivaSuccess = () => {
    setShowCargaMasiva(false);
    navigate("/mis-cargas");
  };

  const isPremium = profile?.subscription_tier === 'premium';

  if (authLoading || contextLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">Publicar Carga</h1>
          </div>
          
          {isPremium && (
            <Dialog open={showCargaMasiva} onOpenChange={setShowCargaMasiva}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Carga Masiva
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl max-h-[90vh]">
                <CargaMasivaForm 
                  onClose={() => setShowCargaMasiva(false)}
                  onSuccess={handleCargaMasivaSuccess}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <CargoForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default PublicarCarga;
