
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
      console.log("Data received:", data);
      
      // Handle tarifa properly - it comes as a number from the form
      let tarifaValue: number;
      if (typeof data.tarifa === 'string') {
        // If it's a string (formatted currency), remove non-numeric characters
        tarifaValue = parseFloat(data.tarifa.replace(/\D/g, ""));
      } else if (typeof data.tarifa === 'number') {
        // If it's already a number, use it directly
        tarifaValue = data.tarifa;
      } else {
        throw new Error("Formato de tarifa inválido");
      }

      const { error } = await supabase.from("cargas").insert({
        origen: data.origen,
        origen_detalle: data.origen_detalle,
        origen_provincia: data.origen_provincia,
        origen_ciudad: data.origen_ciudad,
        destino: data.destino,
        destino_detalle: data.destino_detalle,
        destino_provincia: data.destino_provincia,
        destino_ciudad: data.destino_ciudad,
        fecha_carga_desde: new Date(data.fecha_carga_desde).toISOString(),
        fecha_carga_hasta: data.fecha_carga_hasta ? new Date(data.fecha_carga_hasta).toISOString() : null,
        cantidad_cargas: data.cantidad_cargas,
        tipo_carga: data.tipo_carga,
        tipo_camion: data.tipo_camion,
        tarifa: tarifaValue,
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
