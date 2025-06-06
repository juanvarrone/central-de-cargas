
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Trash2, Eye, CheckCircle, Upload } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import MisCargasFilters, { MisCargasFilters as FiltersType } from "@/components/cargo/MisCargasFilters";
import CargaMasivaForm from "@/components/cargo/CargaMasivaForm";

interface Carga {
  id: string;
  tipo_carga: string;
  origen: string;
  origen_ciudad?: string;
  destino: string;
  destino_ciudad?: string;
  fecha_carga_desde: string;
  estado: string;
  created_at: string;
  tarifa: number;
  tipo_tarifa: string;
  postulaciones?: number;
  postulacion_asignada_id?: string | null;
  transportista?: {
    full_name: string;
    phone_number: string;
    id: string;
  } | null;
}

const MisCargas = () => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [filteredCargas, setFilteredCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCargaMasiva, setShowCargaMasiva] = useState(false);
  const [filters, setFilters] = useState<FiltersType>({
    ordenar: "fecha_desc",
    localidad: "",
    estado: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        toast({
          title: "Acceso restringido",
          description: "Debe iniciar sesión para ver sus cargas",
          variant: "destructive",
        });
        navigate("/auth", { state: { from: "/mis-cargas" } });
        return;
      }
      fetchCargas();
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    applyFilters();
  }, [cargas, filters]);

  const fetchCargas = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      console.log("Fetching cargas for user:", user.id);
      
      // Consulta simple para obtener cargas
      const { data: cargasData, error } = await supabase
        .from("cargas")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching cargas:", error);
        throw error;
      }
      
      console.log("Cargas data:", cargasData);
      
      if (!cargasData) {
        setCargas([]);
        return;
      }

      // Obtener datos adicionales por separado
      const cargasWithExtraData = await Promise.all(
        cargasData.map(async (carga: any) => {
          try {
            // Contar postulaciones
            const { count } = await supabase
              .from("cargas_postulaciones")
              .select("*", { count: "exact", head: true })
              .eq("carga_id", carga.id);
            
            let transportista = null;
            
            // Si hay una postulación asignada, obtener datos del transportista
            if (carga.postulacion_asignada_id) {
              try {
                const { data: postulacion, error: postulacionError } = await supabase
                  .from("cargas_postulaciones")
                  .select("usuario_id")
                  .eq("id", carga.postulacion_asignada_id)
                  .single();
                  
                if (!postulacionError && postulacion) {
                  const { data: transportistaData, error: profileError } = await supabase
                    .from("profiles")
                    .select("full_name, phone_number, id")
                    .eq("id", postulacion.usuario_id)
                    .single();
                    
                  if (!profileError) {
                    transportista = transportistaData;
                  }
                }
              } catch (error) {
                console.error("Error fetching transportista:", error);
              }
            }
            
            return {
              ...carga,
              postulaciones: count || 0,
              transportista
            };
          } catch (countError) {
            console.warn("Error fetching data for carga:", carga.id, countError);
            return {
              ...carga,
              postulaciones: 0,
              transportista: null
            };
          }
        })
      );
      
      console.log("Processed cargas:", cargasWithExtraData);
      setCargas(cargasWithExtraData);
    } catch (error: any) {
      console.error("Error fetching cargas:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al cargar sus cargas",
        variant: "destructive",
      });
      setCargas([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...cargas];

    // Filtrar por localidad
    if (filters.localidad.trim()) {
      const localidadLower = filters.localidad.toLowerCase();
      filtered = filtered.filter(carga => 
        carga.origen.toLowerCase().includes(localidadLower) ||
        carga.destino.toLowerCase().includes(localidadLower) ||
        (carga.origen_ciudad && carga.origen_ciudad.toLowerCase().includes(localidadLower)) ||
        (carga.destino_ciudad && carga.destino_ciudad.toLowerCase().includes(localidadLower))
      );
    }

    // Filtrar por estado
    if (filters.estado) {
      filtered = filtered.filter(carga => carga.estado === filters.estado);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (filters.ordenar) {
        case "fecha_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "fecha_desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "estado":
          return a.estado.localeCompare(b.estado);
        default:
          return 0;
      }
    });

    setFilteredCargas(filtered);
  };

  const cancelarCarga = async (cargaId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("cargas")
        .update({ estado: "cancelada" })
        .eq("id", cargaId);
      
      if (error) throw error;
      
      setCargas((prevCargas) =>
        prevCargas.map((carga) =>
          carga.id === cargaId ? { ...carga, estado: "cancelada" } : carga
        )
      );
      
      toast({
        title: "Carga cancelada",
        description: "La carga ha sido cancelada exitosamente",
      });
      
    } catch (error: any) {
      console.error("Error canceling carga:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la carga",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractCityFromLocation = (location: string): string => {
    // Si ya tenemos la ciudad separada, usarla
    const parts = location.split(',');
    if (parts.length > 0) {
      return parts[0].trim();
    }
    return location;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTipoTarifaLabel = (tipo: string) => {
    switch (tipo) {
      case 'por_viaje':
        return 'por viaje';
      case 'por_tonelada':
        return 'por tn';
      default:
        return '';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'disponible':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'asignada':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'completada':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Mis Cargas</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Listado de cargas que has publicado
        </p>
        <div className="flex gap-2">
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
                onSuccess={fetchCargas}
              />
            </DialogContent>
          </Dialog>
          <Button onClick={() => navigate("/publicar-carga")}>
            Publicar nueva carga
          </Button>
        </div>
      </div>

      <MisCargasFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {loading ? (
        <div className="py-12 text-center">Cargando sus cargas...</div>
      ) : filteredCargas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            {cargas.length === 0 ? (
              <>
                <p className="mb-4">No has publicado ninguna carga todavía.</p>
                <Button onClick={() => navigate("/publicar-carga")}>
                  Publicar primera carga
                </Button>
              </>
            ) : (
              <p>No se encontraron cargas con los filtros aplicados.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCargas.map((carga) => (
            <Card key={carga.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{carga.tipo_carga}</Badge>
                      <Badge className={getEstadoBadgeColor(carga.estado)}>
                        {carga.estado.charAt(0).toUpperCase() + carga.estado.slice(1)}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-lg">
                      {extractCityFromLocation(carga.origen)} → {extractCityFromLocation(carga.destino)}
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      <p>Fecha de carga: {formatDate(carga.fecha_carga_desde)}</p>
                      <p>Publicado: {formatDate(carga.created_at)}</p>
                      <p>Tarifa: {formatCurrency(carga.tarifa)} ({getTipoTarifaLabel(carga.tipo_tarifa)})</p>
                      
                      {carga.transportista && carga.estado === "asignada" && (
                        <div className="mt-2 flex items-center gap-2 text-primary">
                          <CheckCircle size={16} className="fill-green-500 text-white" />
                          <span>Asignada a: <strong>{carga.transportista.full_name}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                    <div className="w-full md:w-auto flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/ver-carga/${carga.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/editar-carga/${carga.id}`)}
                        disabled={carga.estado === "cancelada" || carga.estado === "completada" || carga.estado === "asignada"}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={carga.estado === "cancelada" || carga.estado === "completada"}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Cancelar la carga la marcará como no disponible para los transportistas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => cancelarCarga(carga.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Sí, cancelar carga
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    
                    {typeof carga.postulaciones === 'number' && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 ml-auto mt-2 md:mt-0">
                        {carga.postulaciones} Postulaciones
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCargas;
