
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const MisCargas = () => {
  const [cargas, setCargas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMisCargas = async () => {
      try {
        setLoading(true);
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          throw new Error("No hay usuario autenticado");
        }
        
        const { data, error } = await supabase
          .from("cargas")
          .select("*")
          .eq("usuario_id", userData.user.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        setCargas(data || []);
      } catch (error: any) {
        console.error("Error al obtener cargas:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus cargas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMisCargas();
  }, [toast]);
  
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Mis Cargas Publicadas</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          {cargas.length === 0 ? 'No has publicado cargas' : 
            `Mostrando ${cargas.length} carga${cargas.length !== 1 ? 's' : ''}`}
        </div>
        <Link to="/publicar-carga">
          <Button>Publicar nueva carga</Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Cargando tus cargas...</div>
      ) : (
        <div className="space-y-4">
          {cargas.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p>No has publicado ninguna carga aún.</p>
                <div className="mt-4">
                  <Link to="/publicar-carga">
                    <Button>Publicar tu primera carga</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            cargas.map((carga) => (
              <Card key={carga.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-2">
                  <CardTitle className="text-lg flex justify-between">
                    <span className="flex items-center gap-1">
                      <Truck className="h-5 w-5 text-primary" />
                      {carga.tipo_camion}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      carga.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                      carga.estado === 'en_curso' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {carga.estado === 'disponible' ? 'Disponible' : 
                       carga.estado === 'en_curso' ? 'En curso' : 
                       carga.estado === 'completado' ? 'Completado' : 'Cancelado'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <div className="font-medium">Origen</div>
                          <div>{carga.origen}</div>
                          <div className="text-sm text-gray-500">
                            {carga.origen_ciudad && carga.origen_provincia
                              ? `${carga.origen_ciudad}, ${carga.origen_provincia}`
                              : "Sin detalles de ubicación"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <div className="font-medium">Destino</div>
                          <div>{carga.destino}</div>
                          <div className="text-sm text-gray-500">
                            {carga.destino_ciudad && carga.destino_provincia
                              ? `${carga.destino_ciudad}, ${carga.destino_provincia}`
                              : "Sin detalles de ubicación"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium">Fecha de carga</div>
                          <div>
                            {formatFecha(carga.fecha_carga_desde)}
                            {carga.fecha_carga_hasta && (
                              <> al {formatFecha(carga.fecha_carga_hasta)}</>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <div className="font-medium">Tarifa</div>
                          <div className="text-lg font-semibold">
                            ${new Intl.NumberFormat("es-AR").format(carga.tarifa)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Cantidad: {carga.cantidad_cargas} {carga.cantidad_cargas > 1 ? 'cargas' : 'carga'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {carga.observaciones && (
                    <div className="mt-4 text-sm bg-gray-50 p-3 rounded">
                      <p className="font-medium mb-1">Observaciones:</p>
                      <p>{carga.observaciones}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end gap-2">
                    <Button size="sm" variant="outline">Editar</Button>
                    <Button size="sm" variant="destructive">Cancelar carga</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MisCargas;
