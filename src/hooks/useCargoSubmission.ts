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

      // Log all field validations before insert
      submissionMonitor.logBulkValidation('cargo', [
        { field: 'origen', value: insertData.origen, isValid: !!insertData.origen, errorMessage: insertData.origen ? undefined : 'Origen requerido' },
        { field: 'destino', value: insertData.destino, isValid: !!insertData.destino, errorMessage: insertData.destino ? undefined : 'Destino requerido' },
        { field: 'fecha_carga_desde', value: insertData.fecha_carga_desde, isValid: !!insertData.fecha_carga_desde, errorMessage: insertData.fecha_carga_desde ? undefined : 'Fecha desde requerida' },
        { field: 'cantidad_cargas', value: insertData.cantidad_cargas, isValid: typeof insertData.cantidad_cargas === 'number' && insertData.cantidad_cargas > 0, errorMessage: typeof insertData.cantidad_cargas === 'number' && insertData.cantidad_cargas > 0 ? undefined : 'Cantidad debe ser número > 0' },
        { field: 'tipo_carga', value: insertData.tipo_carga, isValid: !!insertData.tipo_carga, errorMessage: insertData.tipo_carga ? undefined : 'Tipo de carga requerido' },
        { field: 'tipo_camion', value: insertData.tipo_camion, isValid: !!insertData.tipo_camion, errorMessage: insertData.tipo_camion ? undefined : 'Tipo de camión requerido' },
        { field: 'tarifa', value: insertData.tarifa, isValid: typeof insertData.tarifa === 'number' && insertData.tarifa > 0, errorMessage: typeof insertData.tarifa === 'number' && insertData.tarifa > 0 ? undefined : 'Tarifa debe ser número > 0' },
        { field: 'tipo_tarifa', value: insertData.tipo_tarifa, isValid: ['por_viaje', 'por_tonelada'].includes(insertData.tipo_tarifa), errorMessage: ['por_viaje', 'por_tonelada'].includes(insertData.tipo_tarifa) ? undefined : 'Tipo tarifa inválido' },
        { field: 'origen_lat', value: insertData.origen_lat, isValid: insertData.origen_lat === null || typeof insertData.origen_lat === 'number', errorMessage: insertData.origen_lat === null || typeof insertData.origen_lat === 'number' ? undefined : 'Latitud origen debe ser número o null' },
        { field: 'origen_lng', value: insertData.origen_lng, isValid: insertData.origen_lng === null || typeof insertData.origen_lng === 'number', errorMessage: insertData.origen_lng === null || typeof insertData.origen_lng === 'number' ? undefined : 'Longitud origen debe ser número o null' },
        { field: 'destino_lat', value: insertData.destino_lat, isValid: insertData.destino_lat === null || typeof insertData.destino_lat === 'number', errorMessage: insertData.destino_lat === null || typeof insertData.destino_lat === 'number' ? undefined : 'Latitud destino debe ser número o null' },
        { field: 'destino_lng', value: insertData.destino_lng, isValid: insertData.destino_lng === null || typeof insertData.destino_lng === 'number', errorMessage: insertData.destino_lng === null || typeof insertData.destino_lng === 'number' ? undefined : 'Longitud destino debe ser número o null' },
      ]);

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