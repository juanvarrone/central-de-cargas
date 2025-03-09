
import { supabase } from "@/integrations/supabase/client";
import { TruckFormData } from "@/types/truck";

export const useTruckSubmission = () => {
  const submitTruck = async (data: TruckFormData) => {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    // Check if user is authenticated
    if (userError || !userData.user) {
      console.error("Authentication error:", userError);
      throw new Error("Usuario no autenticado");
    }

    // Added error handling and more detailed error messages
    try {
      console.log("Submitting truck availability with user ID:", userData.user.id);
      
      const { error } = await supabase.from("camiones_disponibles").insert({
        origen: data.origen,
        origen_detalle: data.origen_detalle,
        origen_provincia: data.origen_provincia,
        origen_ciudad: data.origen_ciudad,
        destino: data.destino,
        destino_detalle: data.destino_detalle,
        destino_provincia: data.destino_provincia,
        destino_ciudad: data.destino_ciudad,
        fecha_disponible_desde: new Date(data.fecha_disponible_desde).toISOString(),
        fecha_disponible_hasta: data.fecha_disponible_hasta ? new Date(data.fecha_disponible_hasta).toISOString() : null,
        tipo_camion: data.tipo_camion,
        capacidad: data.capacidad,
        refrigerado: data.refrigerado,
        radio_km: data.radio_km,
        observaciones: data.observaciones || null,
        origen_lat: data.origen_lat,
        origen_lng: data.origen_lng,
        destino_lat: data.destino_lat,
        destino_lng: data.destino_lng,
        estado: "disponible",
        usuario_id: userData.user.id,
      });

      if (error) {
        console.error("Error submitting truck availability:", error);
        throw new Error(`Error al publicar disponibilidad: ${error.message}`);
      }
    } catch (error: any) {
      console.error("Error in submitTruck:", error);
      throw error;
    }
  };

  return { submitTruck };
};
