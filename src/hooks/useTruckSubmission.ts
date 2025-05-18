
import { supabase } from "@/integrations/supabase/client";
import { TruckFormData } from "@/types/truck";
import { geocodeAddress } from "@/utils/geocoding";

export const useTruckSubmission = () => {
  const submitTruck = async (data: TruckFormData) => {
    try {
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
      if (!data.origen_provincia || !data.fecha_disponible_desde) {
        throw new Error("Faltan campos requeridos");
      }
      
      // Geocode the address to get coordinates
      let coordinates = null;
      if (data.origen_provincia) {
        coordinates = await geocodeAddress(data.origen_provincia);
        if (coordinates) {
          data.origen_lat = coordinates.lat;
          data.origen_lng = coordinates.lng;
        }
      }
      
      // Format data properly for submission
      const submissionData = {
        origen: data.origen || data.origen_provincia,
        origen_detalle: data.origen_detalle || null,
        origen_provincia: data.origen_provincia,
        origen_ciudad: data.origen_ciudad || null,
        // Since we're now only tracking where the truck will be available,
        // we set destination to match origin
        destino: data.origen || data.origen_provincia,
        destino_detalle: null,
        destino_provincia: data.origen_provincia,
        destino_ciudad: data.origen_ciudad || null,
        fecha_disponible_desde: data.fecha_permanente 
          ? null 
          : new Date(data.fecha_disponible_desde).toISOString(),
        fecha_disponible_hasta: data.fecha_permanente 
          ? null
          : data.fecha_disponible_hasta 
            ? new Date(data.fecha_disponible_hasta).toISOString() 
            : null,
        tipo_camion: data.tipo_camion || "No especificado",
        capacidad: data.capacidad || "No especificada",
        refrigerado: data.refrigerado || false,
        radio_km: data.radio_km || 50,
        observaciones: data.observaciones || null,
        origen_lat: data.origen_lat || 0,
        origen_lng: data.origen_lng || 0,
        destino_lat: data.origen_lat || 0, // Same as origin lat
        destino_lng: data.origen_lng || 0, // Same as origin lng
        estado: "disponible",
        usuario_id: userData.user.id,
        es_permanente: data.fecha_permanente || false
      };
      
      console.log("Final submission data:", submissionData);

      const { error } = await supabase
        .from("camiones_disponibles")
        .insert(submissionData);

      if (error) {
        console.error("Error submitting truck availability:", error);
        throw new Error(`Error al publicar disponibilidad: ${error.message}`);
      }
      
      // Now, let's associate the selected trucks with this availability
      if (data.selected_trucks && data.selected_trucks.length > 0) {
        console.log("Associating trucks with availability:", data.selected_trucks);
        
        // Implementation would go here if needed in the future
      }
      
      console.log("Truck availability submitted successfully");
      return { success: true };
    } catch (error: any) {
      console.error("Error in submitTruck:", error);
      throw error;
    }
  };

  return { submitTruck };
};
