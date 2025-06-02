
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface CargoMapInfoWindowProps {
  cargaId: string;
  tipo: "origen" | "destino";
  lugar: string;
  detalle?: string;
  provincia?: string;
  ciudad?: string;
  tipoCarga: string;
  tipoCamion: string;
  fechaCargaDesde: string;
  fechaCargaHasta?: string | null;
  tarifa: number;
  tipoTarifa: string;
  tarifaAproximada?: boolean;
  observaciones?: string | null;
  // Datos completos de origen y destino
  origen: string;
  origenCiudad?: string;
  origenProvincia?: string;
  destino: string;
  destinoCiudad?: string;
  destinoProvincia?: string;
  onClose: () => void;
}

const CargoMapInfoWindow = ({
  cargaId,
  tipo,
  lugar,
  detalle,
  provincia,
  ciudad,
  tipoCarga,
  tipoCamion,
  fechaCargaDesde,
  fechaCargaHasta,
  tarifa,
  tipoTarifa,
  tarifaAproximada = false,
  observaciones,
  origen,
  origenCiudad,
  origenProvincia,
  destino,
  destinoCiudad,
  destinoProvincia,
  onClose,
}: CargoMapInfoWindowProps) => {
  const { toast } = useToast();
  const [revisarTarifa, setRevisarTarifa] = useState(false);

  const handlePostularse = async () => {
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para postularte a esta carga",
          variant: "destructive",
        });
        return;
      }

      const userId = session.user.id;
      
      // Check if user has already applied to this load
      const { data: existingApplication, error: checkError } = await supabase
        .from('cargas_postulaciones')
        .select("*")
        .eq("carga_id", cargaId)
        .eq("usuario_id", userId)
        .single();
      
      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }
      
      if (existingApplication) {
        toast({
          title: "Ya te has postulado",
          description: "Ya te has postulado a esta carga anteriormente",
        });
        return;
      }
      
      // Create a new application using raw insert
      const { error } = await supabase
        .from('cargas_postulaciones')
        .insert({
          carga_id: cargaId,
          usuario_id: userId,
          estado: "pendiente",
          revisar_tarifa: revisarTarifa
        });

      if (error) throw error;

      toast({
        title: "Postulación exitosa",
        description: "Te has postulado a la carga exitosamente",
      });
      onClose();
    } catch (error: any) {
      console.error("Error al postularse:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar tu postulación",
        variant: "destructive",
      });
    }
  };

  // Calculate cost per km if it's a per-trip rate
  const calculateCostPerKm = () => {
    // This is a simplified calculation - in a real app you'd need the actual distance
    // For now, we'll show a placeholder since we don't have the route calculation
    if (tipoTarifa === "por_viaje") {
      return "Calcular según distancia";
    }
    return null;
  };

  const formatLocation = (lugar: string, ciudad?: string, provincia?: string) => {
    const parts = [lugar];
    if (ciudad) parts.push(ciudad);
    if (provincia) parts.push(provincia);
    return parts.join(", ");
  };

  return (
    <Card className="w-[280px] text-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          {tipo === "origen" ? "📍 Origen" : "🎯 Destino"}: {lugar}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-xs">
        <div className="bg-gray-50 p-2 rounded text-xs">
          <div><strong>De:</strong> {formatLocation(origen, origenCiudad, origenProvincia)}</div>
          <div><strong>A:</strong> {formatLocation(destino, destinoCiudad, destinoProvincia)}</div>
        </div>
        
        {detalle && <div><strong>Detalle:</strong> {detalle}</div>}
        <div><strong>Carga:</strong> {tipoCarga}</div>
        <div><strong>Camión:</strong> {tipoCamion}</div>
        <div><strong>Fecha:</strong> {new Date(fechaCargaDesde).toLocaleDateString()}</div>
        {fechaCargaHasta && (
          <div><strong>Hasta:</strong> {new Date(fechaCargaHasta).toLocaleDateString()}</div>
        )}
        <div>
          <strong>Tarifa:</strong> ${tarifa.toLocaleString()}
          <span className="ml-1 text-xs text-gray-500">
            ({tipoTarifa === "por_viaje" ? "por viaje" : "por tn"})
          </span>
          {tarifaAproximada && <span className="ml-1 text-xs text-gray-500">(aprox.)</span>}
        </div>
        
        {tipoTarifa === "por_viaje" && (
          <div className="text-xs text-blue-600">
            <strong>Costo/km:</strong> {calculateCostPerKm()}
          </div>
        )}
        
        {observaciones && <div><strong>Obs:</strong> {observaciones}</div>}
        
        <div className="flex items-center space-x-2 pt-1">
          <Checkbox 
            id="revisar-tarifa" 
            checked={revisarTarifa} 
            onCheckedChange={(checked) => setRevisarTarifa(checked === true)}
            className="w-3 h-3"
          />
          <label 
            htmlFor="revisar-tarifa" 
            className="text-xs leading-none"
          >
            Revisar tarifa con el dador
          </label>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-7">
          Cerrar
        </Button>
        <Button size="sm" onClick={handlePostularse} className="text-xs h-7">
          Postularse
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CargoMapInfoWindow;
