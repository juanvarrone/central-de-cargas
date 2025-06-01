import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Filter, MapPin, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Carga } from "@/types/mapa-cargas";

const ListadoCargas = () => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [filteredCargas, setFilteredCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchCargas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("cargas")
          .select("*")
          .eq("estado", "disponible");

        if (error) throw error;

        // Cast data to Carga[] to ensure type compatibility
        setCargas(data as unknown as Carga[]);
        setFilteredCargas(data as unknown as Carga[]);
      } catch (error: any) {
        console.error("Error fetching cargas:", error);
        setError(error.message || "Error al cargar las cargas");
        toast({
          title: "Error",
          description: "No se pudieron cargar las cargas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCargas();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
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
            <h1 className="text-xl font-bold">Cargas Disponibles</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter size={16} />
              <span className="hidden sm:inline">Filtrar</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate("/mapa-cargas")}
            >
              <MapPin size={16} />
              <span className="hidden sm:inline">Ver mapa</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCargas.length > 0 ? (
            filteredCargas.map((carga) => (
              <Card key={carga.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50 pb-2">
                  <CardTitle className="text-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Truck size={18} className="text-primary" />
                        {carga.tipo_camion}
                      </div>
                      <div className="text-base font-medium">
                        ${new Intl.NumberFormat("es-AR").format(carga.tarifa)}
                        <span className="ml-1 text-xs text-gray-500">
                          ({getTipoTarifaLabel(carga.tipo_tarifa)})
                        </span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-[24px_1fr] gap-2">
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{carga.origen}</p>
                        <p className="text-sm text-gray-500">
                          {carga.origen_ciudad && carga.origen_provincia ? 
                            `${carga.origen_ciudad}, ${carga.origen_provincia}` : 
                            "Ubicación sin detalles"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[24px_1fr] gap-2">
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{carga.destino}</p>
                        <p className="text-sm text-gray-500">
                          {carga.destino_ciudad && carga.destino_provincia ? 
                            `${carga.destino_ciudad}, ${carga.destino_provincia}` : 
                            "Ubicación sin detalles"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm border-t pt-2">
                      <div>
                        <p className="text-gray-500">Tipo carga:</p>
                        <p className="font-medium">{carga.tipo_carga}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fecha:</p>
                        <p className="font-medium">
                          {new Date(carga.fecha_carga_desde).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <Button className="w-full">Ver detalle</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 mb-4">No hay cargas disponibles con los filtros actuales</p>
              <Button onClick={() => setFilteredCargas(cargas)}>
                Ver todas las cargas
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListadoCargas;
