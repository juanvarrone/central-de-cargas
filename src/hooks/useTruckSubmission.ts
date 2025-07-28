import { supabase } from "@/integrations/supabase/client";
import { TruckFormData } from "@/types/truck";
import { geocodeAddress } from "@/utils/geocoding";
import { submissionMonitor } from "./useSubmissionMonitor";

export const useTruckSubmission = () => {
  const submitTruck = async (data: TruckFormData) => {
    const startTime = Date.now();
    console.log("Starting truck submission with data:", data);
    
    // Log inicio de proceso
    const submissionLogId = submissionMonitor.logSubmissionStart('truck', 'unknown', data);
    
    try {
      // Get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      // Check if user is authenticated
      submissionMonitor.logAuthCheck('truck', userData?.user?.id, !!userData?.user);
      if (userError || !userData.user) {
        console.error("Authentication error:", userError);
        submissionMonitor.logSubmissionError(submissionLogId, 'Usuario no autenticado', Date.now() - startTime);
        throw new Error("Usuario no autenticado");
      }

      // Update submission log with user ID
      submissionMonitor.updateLog(submissionLogId, { userId: userData.user.id });

      // Added detailed console logs for debugging
      console.log("Submitting truck availability with data:", data);
      console.log("User ID:", userData.user.id);
      
      // Check if user has a valid phone number
      const profileConnectionLogId = submissionMonitor.logConnectionAttempt('truck', 'Verificando perfil del usuario');
      const profileStartTime = Date.now();
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', userData.user.id)
        .single();
      
      const profileDuration = Date.now() - profileStartTime;
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        submissionMonitor.logConnectionError(profileConnectionLogId, profileError.message, profileDuration);
        submissionMonitor.logSubmissionError(submissionLogId, 'Error al verificar el perfil del usuario', Date.now() - startTime);
        throw new Error("Error al verificar el perfil del usuario");
      }
      
      submissionMonitor.logConnectionSuccess(profileConnectionLogId, profileDuration);
      submissionMonitor.logValidation('truck', 'phone_number', profileData.phone_number, 
        !!profileData.phone_number, 
        !profileData.phone_number ? 'Debe agregar un número de teléfono válido con WhatsApp en su perfil' : undefined
      );
      
      if (!profileData.phone_number) {
        submissionMonitor.logSubmissionError(submissionLogId, 'Debe agregar un número de teléfono válido con WhatsApp en su perfil', Date.now() - startTime);
        throw new Error("Debe agregar un número de teléfono válido con WhatsApp en su perfil");
      }
      
      // Validate required fields before submission
      const validationResults = [
        { field: 'origen_provincia', value: data.origen_provincia, isValid: !!data.origen_provincia, errorMessage: !data.origen_provincia ? 'Provincia de origen es requerida' : undefined },
        { field: 'fecha_disponible_desde', value: data.fecha_disponible_desde, isValid: !!data.fecha_disponible_desde, errorMessage: !data.fecha_disponible_desde ? 'Fecha de disponibilidad es requerida' : undefined }
      ];
      
      submissionMonitor.logBulkValidation('truck', validationResults);
      
      const failedValidations = validationResults.filter(v => !v.isValid);
      if (failedValidations.length > 0) {
        const errorMessage = failedValidations[0].errorMessage!;
        submissionMonitor.logSubmissionError(submissionLogId, errorMessage, Date.now() - startTime);
        throw new Error(errorMessage);
      }
      
      // Geocode the address to get coordinates
      let coordinates = null;
      if (data.origen_provincia) {
        const geocodingStartTime = Date.now();
        coordinates = await geocodeAddress(data.origen_provincia);
        const geocodingDuration = Date.now() - geocodingStartTime;
        
        submissionMonitor.logGeocoding('truck', data.origen_provincia, !!coordinates, coordinates, 
          !coordinates ? 'No se pudo geocodificar la dirección' : undefined
        );
        
        if (coordinates) {
          data.origen_lat = coordinates.lat;
          data.origen_lng = coordinates.lng;
          submissionMonitor.logFieldProcessing('truck', 'coordinates', data.origen_provincia, coordinates);
        } else {
          submissionMonitor.logSubmissionError(submissionLogId, 'No se pudo geocodificar la dirección de origen', Date.now() - startTime);
          throw new Error("No se pudo geocodificar la dirección de origen");
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

      const connectionLogId = submissionMonitor.logConnectionAttempt('truck', 'Insertando datos en tabla camiones_disponibles');
      const dbStartTime = Date.now();

      const { error } = await supabase
        .from("camiones_disponibles")
        .insert(submissionData);

      const dbDuration = Date.now() - dbStartTime;

      if (error) {
        console.error("Error submitting truck availability:", error);
        submissionMonitor.logConnectionError(connectionLogId, error.message, dbDuration);
        submissionMonitor.logSubmissionError(submissionLogId, `Error de base de datos: ${error.message}`, Date.now() - startTime);
        throw new Error(`Error al publicar disponibilidad: ${error.message}`);
      }
      
      submissionMonitor.logConnectionSuccess(connectionLogId, dbDuration);
      
      // Now, let's associate the selected trucks with this availability
      if (data.selected_trucks && data.selected_trucks.length > 0) {
        console.log("Associating trucks with availability:", data.selected_trucks);
        submissionMonitor.logFieldProcessing('truck', 'selected_trucks', data.selected_trucks.length, 'trucks asociados');
        
        // Implementation would go here if needed in the future
      }
      
      console.log("Truck availability submitted successfully");
      submissionMonitor.logSubmissionSuccess(submissionLogId, Date.now() - startTime, 'Disponibilidad de camión publicada exitosamente');
      return { success: true };
    } catch (error: any) {
      console.error("Error in submitTruck:", error);
      if (!submissionMonitor.getLogs().find(log => log.id === submissionLogId && log.status === 'error')) {
        submissionMonitor.logSubmissionError(submissionLogId, error.message, Date.now() - startTime);
      }
      throw error;
    }
  };

  return { submitTruck };
};