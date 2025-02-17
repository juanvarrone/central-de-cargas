
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, MapPin, Calendar, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Carga {
  id: string;
  origen: string;
  destino: string;
  fecha_carga: string;
  tipo_carga: string;
  tipo_camion: string;
  tarifa: number;
  estado: string;
}

const ListadoCargas = () => {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCargas = async () => {
      try {
        const { data, error } = await supabase
          .from("cargas")
          .select("*")
          .eq("estado", "disponible")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setCargas(data || []);
      } catch (error: any) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Cargando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Cargas Disponibles</h1>
          <Link to="/publicar-carga">
            <Button>Publicar Carga</Button>
          </Link>
        </div>
        
        {cargas.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No hay cargas disponibles en este momento.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {cargas.map((carga) => (
              <Card key={carga.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-neutral-500">Origen</p>
                          <p className="font-medium">{carga.origen}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm text-neutral-500">Destino</p>
                          <p className="font-medium">{carga.destino}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-neutral-600" />
                        <div>
                          <p className="text-sm text-neutral-500">Fecha de Carga</p>
                          <p className="font-medium">
                            {new Date(carga.fecha_carga).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-neutral-600" />
                        <div>
                          <p className="text-sm text-neutral-500">Tipo de Carga</p>
                          <p className="font-medium">{carga.tipo_carga}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-5 h-5 text-neutral-600" />
                        <div>
                          <p className="text-sm text-neutral-500">Tipo de Camión</p>
                          <p className="font-medium">{carga.tipo_camion}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500">Tarifa Propuesta</p>
                        <p className="font-medium">
                          ARS {carga.tarifa.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <Button asChild>
                        <Link to={`/cargas/${carga.id}`}>Ver Detalles</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListadoCargas;
