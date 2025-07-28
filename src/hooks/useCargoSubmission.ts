import { supabase } from "@/integrations/supabase/client";
import { submissionMonitor } from "./useSubmissionMonitor";

export const useCargoSubmission = () => {
  const submitCargo = async (data: any) => {
    const startTime = Date.now();
    console.log("Starting cargo submission with data:", data);
    
    // Log inicio de proceso
    const submissionLogId = submissionMonitor.logSubmissionStart('cargo', 'unknown', data);
    
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    // Check if user is authenticated
    submissionMonitor.logAuthCheck('cargo', userData?.user?.id, !!userData?.user);
    if (userError || !userData.user) {
      console.error("Authentication error:", userError);
      submissionMonitor.logSubmissionError(submissionLogId, 'Usuario no autenticado', Date.now() - startTime);
      throw new Error("Usuario no autenticado");
    }

    // Update submission log with user ID
    submissionMonitor.updateLog(submissionLogId, { userId: userData.user.id });

    // Added error handling and more detailed error messages
    try {
      console.log("Submitting cargo with user ID:", userData.user.id);
      console.log("Data received:", data);
      
      // Handle tarifa properly - ensure it's a valid number
      let tarifaValue: number;
      
      // Check if tarifa is null, undefined, empty string, or 0
      submissionMonitor.logValidation('cargo', 'tarifa', data.tarifa, 
        !(data.tarifa === null || data.tarifa === undefined || data.tarifa === '' || data.tarifa === 0),
        (data.tarifa === null || data.tarifa === undefined || data.tarifa === '' || data.tarifa === 0) ? 'La tarifa es requerida y debe ser mayor a 0' : undefined
      );
      
      if (data.tarifa === null || data.tarifa === undefined || data.tarifa === '' || data.tarifa === 0) {
        submissionMonitor.logSubmissionError(submissionLogId, 'La tarifa es requerida y debe ser mayor a 0', Date.now() - startTime);
        throw new Error("La tarifa es requerida y debe ser mayor a 0");
      }
      
      // Convert to number if it's a string
      if (typeof data.tarifa === 'string') {
        // Remove any non-numeric characters except dots and commas, then convert comma to dot
        const cleanedTarifa = data.tarifa.trim().replace(/[^\d.,]/g, '').replace(',', '.');
        tarifaValue = parseFloat(cleanedTarifa);
        submissionMonitor.logFieldProcessing('cargo', 'tarifa', data.tarifa, cleanedTarifa);
      } else {
        tarifaValue = Number(data.tarifa);
      }
      
      // Validate the number is valid and positive
      const isTarifaValid = !isNaN(tarifaValue) && isFinite(tarifaValue) && tarifaValue > 0;
      submissionMonitor.logValidation('cargo', 'tarifa_final', tarifaValue, isTarifaValid, 
        !isTarifaValid ? 'La tarifa debe ser un número válido mayor a 0' : undefined
      );
      
      if (!isTarifaValid) {
        submissionMonitor.logSubmissionError(submissionLogId, 'La tarifa debe ser un número válido mayor a 0', Date.now() - startTime);
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
      submissionMonitor.logFieldProcessing('cargo', 'cantidad_cargas', data.cantidad_cargas, cantidadCargasValue);

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

      // Log coordinate validation
      if (data.origen_lat || data.origen_lng) {
        submissionMonitor.logValidation('cargo', 'origen_coordinates', 
          { lat: origenLat, lng: origenLng }, 
          origenLat !== null && origenLng !== null,
          (origenLat === null || origenLng === null) ? 'Coordenadas de origen inválidas' : undefined
        );
      }
      
      if (data.destino_lat || data.destino_lng) {
        submissionMonitor.logValidation('cargo', 'destino_coordinates', 
          { lat: destinoLat, lng: destinoLng }, 
          destinoLat !== null && destinoLng !== null,
          (destinoLat === null || destinoLng === null) ? 'Coordenadas de destino inválidas' : undefined
        );
      }

      console.log("Validated coordinates:", {
        origen_lat: origenLat,
        origen_lng: origenLng,
        destino_lat: destinoLat,
        destino_lng: destinoLng
      });

      // Prepare the insert data with clean values
      const insertData = {
        origen: data.origen || '',
        origen_detalle: data.origen_detalle || null,
        origen_provincia: data.origen_provincia || null,
        origen_ciudad: data.origen_ciudad || null,
        destino: data.destino || '',
        destino_detalle: data.destino_detalle || null,
        destino_provincia: data.destino_provincia || null,
        destino_ciudad: data.destino_ciudad || null,
        fecha_carga_desde: new Date(data.fecha_carga_desde).toISOString(),
        fecha_carga_hasta: data.fecha_carga_hasta ? new Date(data.fecha_carga_hasta).toISOString() : null,
        cantidad_cargas: cantidadCargasValue,
        tipo_carga: data.tipo_carga || '',
        tipo_camion: data.tipo_camion || '',
        tarifa: tarifaValue,
        tipo_tarifa: data.tipo_tarifa || 'por_viaje',
        tarifa_aproximada: Boolean(data.tarifa_aproximada),
        modo_pago: data.modo_pago || null,
        observaciones: data.observaciones || null,
        origen_lat: origenLat,
        origen_lng: origenLng,
        destino_lat: destinoLat,
        destino_lng: destinoLng,
        estado: "disponible",
        usuario_id: userData.user.id,
      };

      console.log("Insert data prepared:", insertData);

      const connectionLogId = submissionMonitor.logConnectionAttempt('cargo', 'Insertando datos en tabla cargas');
      const dbStartTime = Date.now();

      const { error } = await supabase.from("cargas").insert(insertData);

      const dbDuration = Date.now() - dbStartTime;

      if (error) {
        console.error("Error submitting cargo:", error);
        submissionMonitor.logConnectionError(connectionLogId, error.message, dbDuration);
        submissionMonitor.logSubmissionError(submissionLogId, `Error de base de datos: ${error.message}`, Date.now() - startTime);
        throw new Error(`Error al publicar carga: ${error.message}`);
      }

      submissionMonitor.logConnectionSuccess(connectionLogId, dbDuration);
      submissionMonitor.logSubmissionSuccess(submissionLogId, Date.now() - startTime, 'Carga publicada exitosamente');
      
    } catch (error: any) {
      console.error("Error in submitCargo:", error);
      if (!submissionMonitor.getLogs().find(log => log.id === submissionLogId && log.status === 'error')) {
        submissionMonitor.logSubmissionError(submissionLogId, error.message, Date.now() - startTime);
      }
      throw error;
    }
  };

  return { submitCargo };
};