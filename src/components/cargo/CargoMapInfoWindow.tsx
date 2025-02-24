
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CargoMapInfoWindowProps {
  cargaId: string;
  tipo: "origen" | "destino";
  lugar: string;
  detalle?: string;
  tipoCarga: string;
  tipoCamion: string;
  fechaCargaDesde: string;
  fechaCargaHasta?: string | null;
  tarifa: number;
  observaciones?: string | null;
  onClose: () => void;
}

const CargoMapInfoWindow = ({
  cargaId,
  tipo,
  lugar,
  detalle,
  tipoCarga,
  tipoCamion,
  fechaCargaDesde,
  fechaCargaHasta,
  tarifa,
  observaciones,
  onClose,
}: CargoMapInfoWindowProps) => {
  const { toast } = useToast();

  const handleTomarCarga = async () => {
    try {
      const { error } = await supabase
        .from("cargas")
        .update({ estado: "tomada" })
        .eq("id", cargaId);

      if (error) throw error;

      toast({
        title: "Carga tomada",
        description: "La carga ha sido tomada exitosamente",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo tomar la carga",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle className="text-lg">
          {tipo === "origen" ? "Origen" : "Destino"}: {lugar}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {detalle && <p><strong>Detalle:</strong> {detalle}</p>}
        <p><strong>Tipo de carga:</strong> {tipoCarga}</p>
        <p><strong>Tipo de camión:</strong> {tipoCamion}</p>
        <p><strong>Fecha de carga:</strong> {new Date(fechaCargaDesde).toLocaleDateString()}</p>
        {fechaCargaHasta && (
          <p><strong>Hasta:</strong> {new Date(fechaCargaHasta).toLocaleDateString()}</p>
        )}
        <p><strong>Tarifa:</strong> ${tarifa}</p>
        {observaciones && <p><strong>Observaciones:</strong> {observaciones}</p>}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button onClick={handleTomarCarga}>
          Tomar carga
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CargoMapInfoWindow;
