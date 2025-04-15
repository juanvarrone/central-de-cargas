
import { Link } from "react-router-dom";
import { User as UserIcon, Menu, LogOut, Truck, Bell, Settings, CreditCard, MapPin, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const { user, isAdmin, isLoading } = useAuth();

  console.log("Layout rendering with user:", !!user, "isAdmin:", isAdmin);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      window.location.href = '/auth';
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-primary">
              <Logo size="medium" />
            </Link>
            
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-3">
                  <Link to="/mapa-cargas" className="hidden sm:flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                    <Map size={18} />
                    <span>Mapa</span>
                  </Link>
                  
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
                        <Link to="/configurar-alertas" className="flex items-center">
                          <Bell size={16} className="mr-2" />
                          Mis Alertas
                        </Link>
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/premium" className="flex items-center">
                          <CreditCard size={16} className="mr-2" />
                          Plan Premium
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
                </div>
              ) : (
                <Button 
                  asChild 
                  variant="default"
                  className="bg-primary hover:bg-primary/90 text-white transition-colors"
                >
                  <Link to="/auth">Iniciar sesión</Link>
                </Button>
              )
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="border-t mt-auto py-6 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo size="small" />
              <p className="text-sm text-muted-foreground mt-2">
                Sistema de gestión de cargas y camiones
              </p>
            </div>
            <div className="flex space-x-6">
              <Link to="/terminos-condiciones" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Términos y condiciones
              </Link>
              <Link to="/politicas-privacidad" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Políticas de privacidad
              </Link>
            </div>
          </div>
          <div className="highway-divider my-6"></div>
          <div className="text-xs text-center text-muted-foreground">
            © {new Date().getFullYear()} Central de Cargas. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
