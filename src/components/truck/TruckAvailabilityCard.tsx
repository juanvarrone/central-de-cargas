
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Calendar, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TruckAvailability {
  id: string;
  origen: string;
  origen_provincia: string;
  origen_ciudad: string;
  radio_km: number;
  fecha_disponible_desde: string;
  fecha_disponible_hasta: string | null;
  es_permanente: boolean;
  estado: string;
}

interface UserTruck {
  id: string;
  tipo_camion: string;
  capacidad: string;
  refrigerado: boolean;
  patente_chasis: string;
  foto_chasis?: string | null;
  foto_chasis_thumbnail?: string | null;
}

interface TruckAvailabilityCardProps {
  truck: UserTruck;
  onAvailabilityChange?: () => void;
}

const TruckAvailabilityCard = ({ truck, onAvailabilityChange }: TruckAvailabilityCardProps) => {
  const [availability, setAvailability] = useState<TruckAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTruckAvailability();
  }, [truck.id]);

  const fetchTruckAvailability = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("camiones_disponibles")
        .select("*")
        .contains("selected_trucks", [truck.id])
        .eq("estado", "disponible")
        .gte("fecha_disponible_hasta", new Date().toISOString())
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setAvailability(data);
    } catch (error) {
      console.error("Error fetching truck availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvailability = async () => {
    if (!availability) return;

    try {
      const { error } = await supabase
        .from("camiones_disponibles")
        .update({ estado: "cancelado" })
        .eq("id", availability.id);

      if (error) throw error;

      toast({
        title: "Disponibilidad eliminada",
        description: "La disponibilidad ha sido eliminada correctamente",
      });

      setAvailability(null);
      onAvailabilityChange?.();
    } catch (error) {
      console.error("Error deleting availability:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la disponibilidad",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Truck className="h-4 w-4" />
          {truck.tipo_camion} - {truck.capacidad}
          {truck.refrigerado && <Badge variant="secondary" className="text-xs">Refrigerado</Badge>}
        </CardTitle>
        <p className="text-xs text-muted-foreground">Patente: {truck.patente_chasis}</p>
      </CardHeader>
      <CardContent className="pt-0">
        {availability ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-green-600">Disponible</Badge>
                {availability.es_permanente && (
                  <Badge variant="outline" className="text-xs">Permanente</Badge>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{availability.origen}</p>
                    <p className="text-xs text-muted-foreground">
                      {availability.origen_ciudad}, {availability.origen_provincia}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Radio: {availability.radio_km} km
                    </p>
                  </div>
                </div>
                
                {!availability.es_permanente && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                      <p>Desde: {format(new Date(availability.fecha_disponible_desde), "dd/MM/yyyy")}</p>
                      {availability.fecha_disponible_hasta && (
                        <p>Hasta: {format(new Date(availability.fecha_disponible_hasta), "dd/MM/yyyy")}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => {
                  // TODO: Implement edit functionality
                  toast({
                    title: "Función en desarrollo",
                    description: "La edición de disponibilidad estará disponible próximamente",
                  });
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Modificar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 text-xs"
                onClick={handleDeleteAvailability}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              No hay disponibilidad activa
            </p>
            <Badge variant="secondary" className="text-xs">Sin disponibilidad</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TruckAvailabilityCard;
