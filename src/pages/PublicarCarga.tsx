
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CargoForm, { cargaSchema } from "@/components/cargo/CargoForm";
import { z } from "zod";

const PublicarCarga = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (data: z.infer<typeof cargaSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("cargas").insert({
        origen: data.origen,
        origen_detalle: data.origen_detalle,
        destino: data.destino,
        destino_detalle: data.destino_detalle,
        fecha_carga_desde: new Date(data.fecha_carga_desde).toISOString(),
        fecha_carga_hasta: data.fecha_carga_hasta ? new Date(data.fecha_carga_hasta).toISOString() : null,
        cantidad_cargas: data.cantidadCargas,
        tipo_carga: data.tipoCarga,
        tipo_camion: data.tipoCamion,
        tarifa: parseFloat(data.tarifa.replace(/\D/g, "")),
        observaciones: data.observaciones || null,
        origen_lat: data.origen_lat,
        origen_lng: data.origen_lng,
        destino_lat: data.destino_lat,
        destino_lng: data.destino_lng,
        estado: "disponible",
      });

      if (error) throw error;

      toast({
        title: "Carga publicada",
        description: "Tu carga ha sido publicada exitosamente",
      });
      navigate("/listado-cargas");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Publicar Nueva Carga</CardTitle>
          </CardHeader>
          <CardContent>
            <CargoForm onSubmit={onSubmit} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicarCarga;
