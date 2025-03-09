
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { User as UserIcon, Menu, LogOut, Truck, Bell, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Check if user is admin
          const { data: isAdminData, error: isAdminError } = await supabase
            .rpc('is_admin', { user_id: user.id });
            
          if (!isAdminError && isAdminData) {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          // Check if user is admin
          const { data: isAdminData, error: isAdminError } = await supabase
            .rpc('is_admin', { user_id: session.user.id });
            
          if (!isAdminError && isAdminData) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <Link to="/" className="text-xl font-bold text-primary">
            Central de Cargas
          </Link>
          {!loading && (
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
                  
                  {isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/admin" className="flex items-center">
                        <Settings size={16} className="mr-2" />
                        Panel de Administración
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                    <LogOut size={16} className="mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                asChild 
                variant="outline"
                className="hover:bg-primary hover:text-white transition-colors"
              >
                <Link to="/auth">Iniciar sesión</Link>
              </Button>
            )
          )}
        </div>

        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Sistema de Gestión de Cargas</CardTitle>
            <CardDescription className="text-center">
              Plataforma para la publicación y búsqueda de cargas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleNavigate("/publicar-carga")}
                className="w-full h-16 text-lg"
              >
                Publicar Carga
              </Button>
              <Button
                onClick={() => handleNavigate("/buscar-cargas")}
                className="w-full h-16 text-lg"
                variant="outline"
              >
                Buscar Cargas
              </Button>
              <Button
                onClick={() => handleNavigate("/publicar-camion")}
                className="w-full h-16 text-lg"
                variant="outline"
              >
                Publicar Camión
              </Button>
              <Button
                onClick={() => handleNavigate("/buscar-camiones")}
                className="w-full h-16 text-lg"
                variant="outline"
              >
                Buscar Camiones
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">Versión 1.0.0</p>
          <div className="space-x-4">
            <Link 
              to="/terminos-condiciones" 
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Términos y Condiciones
            </Link>
            <span>•</span>
            <Link 
              to="/politicas-privacidad" 
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Políticas de Privacidad
            </Link>
          </div>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} Sistema de Gestión de Cargas. Todos los derechos reservados. CUIT: XX-XXXXXXXX-X
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
