
import { supabase } from "@/integrations/supabase/client";

export const useCargoSubmission = () => {
  const submitCargo = async (data: any) => {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    // Check if user is authenticated
    if (userError || !userData.user) {
      console.error("Authentication error:", userError);
      throw new Error("Usuario no autenticado");
    }

    // Added error handling and more detailed error messages
    try {
      console.log("Submitting cargo with user ID:", userData.user.id);
      
      const { error } = await supabase.from("cargas").insert({
        origen: data.origen,
        destino: data.destino,
        fecha_carga_desde: new Date(data.fecha_carga_desde).toISOString(),
        fecha_carga_hasta: data.fecha_carga_hasta ? new Date(data.fecha_carga_hasta).toISOString() : null,
        cantidad_cargas: data.cantidad_cargas,
        tipo_carga: data.tipo_carga,
        tipo_camion: data.tipo_camion,
        tarifa: data.tarifa,
        tipo_tarifa: data.tipo_tarifa,
        tarifa_aproximada: data.tarifa_aproximada,
        modo_pago: data.modo_pago,
        observaciones: data.observaciones || null,
        origen_lat: data.origen_lat,
        origen_lng: data.origen_lng,
        destino_lat: data.destino_lat,
        destino_lng: data.destino_lng,
        estado: "disponible",
        usuario_id: userData.user.id,
      });

      if (error) {
        console.error("Error submitting cargo:", error);
        throw new Error(`Error al publicar carga: ${error.message}`);
      }
    } catch (error: any) {
      console.error("Error in submitCargo:", error);
      throw error;
    }
  };

  return { submitCargo };
};
