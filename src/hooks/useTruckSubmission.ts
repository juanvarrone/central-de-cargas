
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

    // Added detailed console logs for debugging
    console.log("Submitting truck availability with data:", data);
    console.log("User ID:", userData.user.id);
    
    try {
      // Check if user has a valid phone number
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', userData.user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw new Error("Error al verificar el perfil del usuario");
      }
      
      if (!profileData.phone_number) {
        throw new Error("Debe agregar un número de teléfono válido con WhatsApp en su perfil");
      }
      
      // Validate required fields before submission
      if (!data.origen_provincia || !data.destino_provincia || !data.fecha_disponible_desde) {
        throw new Error("Faltan campos requeridos");
      }
      
      // Format data properly
      const submissionData = {
        origen: data.origen || `${data.origen_provincia}, ${data.origen_ciudad || ''}`.trim(),
        origen_detalle: data.origen_detalle || null,
        origen_provincia: data.origen_provincia,
        origen_ciudad: data.origen_ciudad || null,
        destino: data.destino || `${data.destino_provincia}, ${data.destino_ciudad || ''}`.trim(),
        destino_detalle: data.destino_detalle || null,
        destino_provincia: data.destino_provincia,
        destino_ciudad: data.destino_ciudad || null,
        fecha_disponible_desde: new Date(data.fecha_disponible_desde).toISOString(),
        fecha_disponible_hasta: data.fecha_disponible_hasta ? new Date(data.fecha_disponible_hasta).toISOString() : null,
        tipo_camion: data.tipo_camion,
        capacidad: data.capacidad,
        refrigerado: data.refrigerado,
        radio_km: data.radio_km,
        observaciones: data.observaciones || null,
        origen_lat: data.origen_lat || 0,
        origen_lng: data.origen_lng || 0,
        destino_lat: data.destino_lat || 0,
        destino_lng: data.destino_lng || 0,
        estado: "disponible",
        usuario_id: userData.user.id
      };
      
      console.log("Final submission data:", submissionData);

      const { error } = await supabase
        .from("camiones_disponibles")
        .insert(submissionData);

      if (error) {
        console.error("Error submitting truck availability:", error);
        throw new Error(`Error al publicar disponibilidad: ${error.message}`);
      }
      
      console.log("Truck availability submitted successfully");
    } catch (error: any) {
      console.error("Error in submitTruck:", error);
      throw error;
    }
  };

  return { submitTruck };
};
