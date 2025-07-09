
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
      
      // Handle tarifa properly - ensure it's a valid number
      let tarifaValue: number;
      if (data.tarifa === null || data.tarifa === undefined || data.tarifa === '') {
        throw new Error("La tarifa es requerida");
      }
      
      // Convert to number if it's a string
      if (typeof data.tarifa === 'string') {
        // Remove any non-numeric characters except dots and commas
        const cleanedTarifa = data.tarifa.replace(/[^\d.,]/g, '').replace(',', '.');
        tarifaValue = parseFloat(cleanedTarifa);
      } else {
        tarifaValue = Number(data.tarifa);
      }
      
      // Validate the number
      if (isNaN(tarifaValue) || tarifaValue <= 0) {
        throw new Error("La tarifa debe ser un número válido mayor a 0");
      }

      // Handle cantidad_cargas properly
      let cantidadCargasValue: number = 1;
      if (data.cantidad_cargas !== null && data.cantidad_cargas !== undefined) {
        cantidadCargasValue = Number(data.cantidad_cargas);
        if (isNaN(cantidadCargasValue) || cantidadCargasValue < 1) {
          cantidadCargasValue = 1;
        }
      }

      // Handle coordinates - convert empty strings, undefined, or NaN to null
      const validateCoordinate = (coord: any): number | null => {
        if (coord === null || coord === undefined || coord === '' || coord === 'undefined') {
          return null;
        }
        const numCoord = Number(coord);
        return isNaN(numCoord) ? null : numCoord;
      };

      const origenLat = validateCoordinate(data.origen_lat);
      const origenLng = validateCoordinate(data.origen_lng);
      const destinoLat = validateCoordinate(data.destino_lat);
      const destinoLng = validateCoordinate(data.destino_lng);

      console.log("Validated coordinates:", {
        origen_lat: origenLat,
        origen_lng: origenLng,
        destino_lat: destinoLat,
        destino_lng: destinoLng
      });

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
        cantidad_cargas: cantidadCargasValue,
        tipo_carga: data.tipo_carga,
        tipo_camion: data.tipo_camion,
        tarifa: tarifaValue,
        tipo_tarifa: data.tipo_tarifa,
        tarifa_aproximada: data.tarifa_aproximada,
        modo_pago: data.modo_pago,
        observaciones: data.observaciones || null,
        origen_lat: origenLat,
        origen_lng: origenLng,
        destino_lat: destinoLat,
        destino_lng: destinoLng,
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
