
import { Button } from "@/components/ui/card";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package, 
  MapPin, 
  Calendar, 
  Truck, 
  Search, 
  ArrowLeft, 
  User as UserIcon,
  Menu,
  LogOut,
  Bell
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { User } from "@supabase/supabase-js";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button as ButtonUI } from "@/components/ui/button";

interface Carga {
  id: string;
  origen: string;
  origen_detalle: string | null;
  origen_provincia: string | null;
  origen_ciudad: string | null;
  destino: string;
  destino_detalle: string | null;
  destino_provincia: string | null;
  destino_ciudad: string | null;
  fecha_carga_desde: string;
  fecha_carga_hasta: string | null;
  tipo_carga: string;
  tipo_camion: string;
  tarifa: number;
  estado: string;
  cantidad_cargas: number;
  observaciones: string | null;
}

const ListadoCargas = () => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [filteredCargas, setFilteredCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoCargaFilter, setTipoCargaFilter] = useState("");
  const [tipoCamionFilter, setTipoCamionFilter] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [tiposCarga, setTiposCarga] = useState<string[]>([]);
  const [tiposCamion, setTiposCamion] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
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
  }, []);

  useEffect(() => {
    const fetchCargas = async () => {
      setError(null);
      try {
        console.log("Fetching cargas...");
        const { data, error } = await supabase
          .from("cargas")
          .select("*")
          .eq("estado", "disponible")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Cargas data:", data);
        setCargas(data || []);
        setFilteredCargas(data || []);
        
        // Extract unique cargo types and truck types for filters
        if (data && data.length > 0) {
          const uniqueTiposCarga = [...new Set(data.map(carga => carga.tipo_carga))];
          const uniqueTiposCamion = [...new Set(data.map(carga => carga.tipo_camion))];
          console.log("Tipos de carga:", uniqueTiposCarga);
          console.log("Tipos de camión:", uniqueTiposCamion);
          setTiposCarga(uniqueTiposCarga);
          setTiposCamion(uniqueTiposCamion);
        }
      } catch (error: any) {
        console.error("Error catching block:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: "No se pudieron cargar las cargas disponibles",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCargas();
  }, [toast]);

  useEffect(() => {
    // Apply filters whenever search term or filter values change
    let results = cargas;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(
        carga =>
          carga.origen?.toLowerCase().includes(search) ||
          carga.destino?.toLowerCase().includes(search) ||
          carga.tipo_carga?.toLowerCase().includes(search) ||
          carga.tipo_camion?.toLowerCase().includes(search) ||
          carga.origen_provincia?.toLowerCase().includes(search) ||
          carga.destino_provincia?.toLowerCase().includes(search)
      );
    }
    
    if (tipoCargaFilter) {
      results = results.filter(carga => carga.tipo_carga === tipoCargaFilter);
    }
    
    if (tipoCamionFilter) {
      results = results.filter(carga => carga.tipo_camion === tipoCamionFilter);
    }
    
    setFilteredCargas(results);
  }, [searchTerm, tipoCargaFilter, tipoCamionFilter, cargas]);

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
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Cargando...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-red-500">{error}</p>
          <ButtonUI onClick={() => window.location.reload()} className="mt-4">
            Intentar nuevamente
          </ButtonUI>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <ButtonUI 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft size={20} />
            </ButtonUI>
            <h1 className="text-3xl font-bold">Cargas Disponibles</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/publicar-carga">
              <ButtonUI>Publicar Carga</ButtonUI>
            </Link>
            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ButtonUI variant="outline" className="flex items-center gap-2">
                      <UserIcon size={16} />
                      <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                      <Menu size={16} className="ml-1" />
                    </ButtonUI>
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
                <ButtonUI asChild variant="outline">
                  <Link to="/auth">Iniciar sesión</Link>
                </ButtonUI>
              )
            )}
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por origen, destino o tipo..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-56">
                <Select
                  value={tipoCargaFilter}
                  onValueChange={setTipoCargaFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de carga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los tipos</SelectItem>
                    {tiposCarga.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-56">
                <Select
                  value={tipoCamionFilter}
                  onValueChange={setTipoCamionFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de camión" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los camiones</SelectItem>
                    {tiposCamion.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {filteredCargas.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay cargas disponibles que coincidan con los filtros.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origen</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo Carga</TableHead>
                  <TableHead>Tipo Camión</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Tarifa (ARS)</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCargas.map((carga) => (
                  <TableRow key={carga.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                        <div>
                          <p className="font-medium">{carga.origen}</p>
                          {carga.origen_detalle && (
                            <p className="text-xs text-muted-foreground">{carga.origen_detalle}</p>
                          )}
                          {carga.origen_provincia && (
                            <p className="text-xs text-muted-foreground">{carga.origen_provincia}, {carga.origen_ciudad}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-600 mt-1" />
                        <div>
                          <p className="font-medium">{carga.destino}</p>
                          {carga.destino_detalle && (
                            <p className="text-xs text-muted-foreground">{carga.destino_detalle}</p>
                          )}
                          {carga.destino_provincia && (
                            <p className="text-xs text-muted-foreground">{carga.destino_provincia}, {carga.destino_ciudad}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p>{new Date(carga.fecha_carga_desde).toLocaleDateString()}</p>
                          {carga.fecha_carga_hasta && (
                            <p className="text-xs text-muted-foreground">
                              hasta {new Date(carga.fecha_carga_hasta).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>{carga.tipo_carga}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <span>{carga.tipo_camion}</span>
                      </div>
                    </TableCell>
                    <TableCell>{carga.cantidad_cargas}</TableCell>
                    <TableCell>{carga.tarifa.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <ButtonUI asChild size="sm">
                        <Link to={`/cargas/${carga.id}`}>Ver Detalles</Link>
                      </ButtonUI>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListadoCargas;
