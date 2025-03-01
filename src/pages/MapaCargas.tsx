
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import CargoMapFilters from "@/components/cargo/CargoMapFilters";
import CargasMapa from "@/components/cargo/CargasMapa";
import { Filters } from "@/types/mapa-cargas";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, Menu, LogOut } from "lucide-react";

const MapaCargas = () => {
  const [filters, setFilters] = useState<Filters>({});
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-end mb-4 py-2">
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
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/mis-cargas">Mis Cargas</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/mis-alertas">Mis Alertas</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
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
        <div className="flex gap-4 h-[calc(100vh-10rem)]">
          <Card className="flex-1 relative">
            <CargasMapa filters={filters} />
          </Card>
          <div className="w-80">
            <Card className="p-4 h-full">
              <CargoMapFilters onFilterChange={handleFilterChange} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaCargas;
