
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Map as MapIcon, 
  List, 
  User as UserIcon, 
  Menu, 
  LogOut, 
  Truck, 
  Bell
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import TruckMapFilters from "@/components/truck/TruckMapFilters";
import TruckListView from "@/components/truck/TruckListView";
import TrucksMapa from "@/components/truck/TrucksMapa";
import { TruckFilters } from "@/types/truck";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const BuscarCamiones = () => {
  const [filters, setFilters] = useState<TruckFilters>({});
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"map" | "list">("list");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "No se pudo verificar tu sesión. Por favor intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
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
  }, [toast]);

  const handleFilterChange = (newFilters: TruckFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center mb-4 py-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <Link to="/" className="text-xl font-bold text-primary">
              Central de Cargas
            </Link>
          </div>
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
                    <Link to="/mis-camiones" className="flex items-center">
                      <Truck size={16} className="mr-2" />
                      Mis Camiones
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
        
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
          <div>
            <Card className="p-4 sticky top-4">
              <TruckMapFilters onFilterChange={handleFilterChange} />
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-4">
              <CardContent className="p-0">
                <Tabs value={view} onValueChange={(v) => setView(v as "map" | "list")} className="w-full">
                  <div className="flex justify-end mb-3">
                    <TabsList>
                      <TabsTrigger value="list" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        <span className="hidden sm:inline">Lista</span>
                      </TabsTrigger>
                      <TabsTrigger value="map" className="flex items-center gap-2">
                        <MapIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Mapa</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="list" className="w-full mt-0">
                    <TruckListView filters={filters} />
                  </TabsContent>
                  
                  <TabsContent value="map" className="w-full mt-0">
                    <div className="h-[60vh] w-full rounded-md overflow-hidden border">
                      <TrucksMapa filters={filters} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuscarCamiones;
