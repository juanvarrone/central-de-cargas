
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  observaciones?: string | null;
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
  observaciones,
  onClose,
}: CargoMapInfoWindowProps) => {
  const { toast } = useToast();

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
      // We use a raw query since the type definition isn't available
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
          estado: "pendiente"
        } as any);

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

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle className="text-lg">
          {tipo === "origen" ? "Origen" : "Destino"}: {lugar}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {detalle && <p><strong>Detalle:</strong> {detalle}</p>}
        {provincia && <p><strong>Provincia:</strong> {provincia}</p>}
        {ciudad && <p><strong>Ciudad:</strong> {ciudad}</p>}
        <p><strong>Tipo de carga:</strong> {tipoCarga}</p>
        <p><strong>Tipo de camión:</strong> {tipoCamion}</p>
        <p><strong>Fecha de carga:</strong> {new Date(fechaCargaDesde).toLocaleDateString()}</p>
        {fechaCargaHasta && (
          <p><strong>Hasta:</strong> {new Date(fechaCargaHasta).toLocaleDateString()}</p>
        )}
        <p><strong>Tarifa:</strong> ${tarifa.toLocaleString()}</p>
        {observaciones && <p><strong>Observaciones:</strong> {observaciones}</p>}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button onClick={handlePostularse}>
          Postularse
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CargoMapInfoWindow;
