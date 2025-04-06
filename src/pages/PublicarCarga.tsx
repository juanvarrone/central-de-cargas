
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import CargoForm from "@/components/cargo/CargoForm";
import { useCargoSubmission } from "@/hooks/useCargoSubmission";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  User as UserIcon, 
  Menu, 
  LogOut, 
  Truck, 
  Bell 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useUserProfile } from "@/hooks/useUserProfile";

const PublicarCarga = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { submitCargo } = useCargoSubmission();
  const { profile, isLoading: profileLoading } = useUserProfile();

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

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Sesión finalizada",
            description: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
            variant: "destructive",
          });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, toast]);

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

    // Check if the user has the right profile type
    if (profile && profile.user_type === 'camionero') {
      toast({
        title: "Acceso restringido",
        description: "Como perfil Camionero, no puedes publicar cargas. Esta funcionalidad es solo para Dadores de Cargas.",
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-2xl mx-auto px-4">
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
          {!authLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <UserIcon size={16} />
                    <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                    <Menu size={16} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/mis-cargas" className="flex items-center">
                      <Truck size={16} className="mr-2" />
                      Mis Cargas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/mis-alertas" className="flex items-center">
                      <Bell size={16} className="mr-2" />
                      Mis Alertas
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                    <LogOut size={16} className="mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline">
                <Link to="/auth">Iniciar sesión</Link>
              </Button>
            )
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Publicar Nueva Carga</CardTitle>
          </CardHeader>
          <CardContent>
            <CargoForm onSubmit={handleSubmit} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicarCarga;
