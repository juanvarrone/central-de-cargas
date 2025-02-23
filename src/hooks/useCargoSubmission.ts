
import { supabase } from "@/integrations/supabase/client";

export const useCargoSubmission = () => {
  const submitCargo = async (data: any) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error("Usuario no autenticado");
    }

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
      usuario_id: user.data.user.id,
    });

    if (error) throw error;
  };

  return { submitCargo };
};
