
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

    try {
      console.log("Raw data received:", data);

      // Sanitize function to convert empty strings to null
      const sanitizeValue = (value: any, isNumeric = false): any => {
        if (value === null || value === undefined || value === '' || value === 'undefined') {
          return null;
        }
        if (isNumeric) {
          const numValue = Number(value);
          return isNaN(numValue) ? null : numValue;
        }
        return value;
      };

      // Handle tarifa with strict validation
      let tarifaValue: number;
      const rawTarifa = data.tarifa;
      
      console.log("Processing tarifa:", rawTarifa, "type:", typeof rawTarifa);
      
      if (rawTarifa === null || rawTarifa === undefined || rawTarifa === '') {
        throw new Error("La tarifa es requerida");
      }
      
      // Convert to number if it's a string
      if (typeof rawTarifa === 'string') {
        // Remove any non-numeric characters except dots and commas
        const cleanedTarifa = rawTarifa.replace(/[^\d.,]/g, '').replace(',', '.');
        tarifaValue = parseFloat(cleanedTarifa);
      } else {
        tarifaValue = Number(rawTarifa);
      }
      
      // Validate the number
      if (isNaN(tarifaValue) || tarifaValue <= 0) {
        throw new Error("La tarifa debe ser un número válido mayor a 0");
      }

      // Handle cantidad_cargas properly
      let cantidadCargasValue: number = 1;
      if (data.cantidad_cargas !== null && data.cantidad_cargas !== undefined && data.cantidad_cargas !== '') {
        cantidadCargasValue = Number(data.cantidad_cargas);
        if (isNaN(cantidadCargasValue) || cantidadCargasValue < 1) {
          cantidadCargasValue = 1;
        }
      }

      // Sanitize coordinates
      const origenLat = sanitizeValue(data.origen_lat, true);
      const origenLng = sanitizeValue(data.origen_lng, true);
      const destinoLat = sanitizeValue(data.destino_lat, true);
      const destinoLng = sanitizeValue(data.destino_lng, true);

      // Sanitize all text fields to avoid empty strings
      const cleanedData = {
        origen: data.origen || null,
        origen_detalle: sanitizeValue(data.origen_detalle),
        origen_provincia: sanitizeValue(data.origen_provincia),
        origen_ciudad: sanitizeValue(data.origen_ciudad),
        destino: data.destino || null,
        destino_detalle: sanitizeValue(data.destino_detalle),
        destino_provincia: sanitizeValue(data.destino_provincia),
        destino_ciudad: sanitizeValue(data.destino_ciudad),
        fecha_carga_desde: new Date(data.fecha_carga_desde).toISOString(),
        fecha_carga_hasta: data.fecha_carga_hasta ? new Date(data.fecha_carga_hasta).toISOString() : null,
        cantidad_cargas: cantidadCargasValue,
        tipo_carga: data.tipo_carga || null,
        tipo_camion: data.tipo_camion || null,
        tarifa: tarifaValue,
        tipo_tarifa: data.tipo_tarifa || 'por_viaje',
        tarifa_aproximada: data.tarifa_aproximada || false,
        modo_pago: sanitizeValue(data.modo_pago),
        observaciones: sanitizeValue(data.observaciones),
        origen_lat: origenLat,
        origen_lng: origenLng,
        destino_lat: destinoLat,
        destino_lng: destinoLng,
        estado: "disponible",
        usuario_id: userData.user.id,
      };

      console.log("Cleaned data before insert:", cleanedData);
      
      // Validate required fields
      if (!cleanedData.origen) {
        throw new Error("El origen es requerido");
      }
      if (!cleanedData.destino) {
        throw new Error("El destino es requerido");
      }
      if (!cleanedData.tipo_carga) {
        throw new Error("El tipo de carga es requerido");
      }
      if (!cleanedData.tipo_camion) {
        throw new Error("El tipo de camión es requerido");
      }

      const { error } = await supabase.from("cargas").insert(cleanedData);

      if (error) {
        console.error("Error submitting cargo:", error);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);
        console.error("Error message:", error.message);
        throw new Error(`Error al publicar carga: ${error.message}`);
      }

      console.log("Cargo submitted successfully!");
      
    } catch (error: any) {
      console.error("Error in submitCargo:", error);
      throw error;
    }
  };

  return { submitCargo };
};
