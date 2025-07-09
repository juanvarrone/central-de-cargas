
import { supabase } from "@/integrations/supabase/client";

export const useCargoSubmission = () => {
  const submitCargo = async (data: any) => {
    console.log("🚀 Starting cargo submission process...");
    console.log("📦 Raw form data received:", data);

    // Step 1: Authentication check
    console.log("🔒 Checking authentication...");
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("❌ Authentication error:", userError);
      throw new Error("Usuario no autenticado");
    }
    console.log("✅ User authenticated:", userData.user.id);

    try {
      // Step 2: Data sanitization
      console.log("🧹 Starting data sanitization...");
      
      // Sanitize function to convert empty strings to null
      const sanitizeValue = (value: any, isNumeric = false): any => {
        console.log(`🔍 Sanitizing value: ${JSON.stringify(value)} (isNumeric: ${isNumeric})`);
        
        if (value === null || value === undefined || value === '' || value === 'undefined') {
          console.log("→ Converting to null");
          return null;
        }
        
        if (isNumeric) {
          const numValue = Number(value);
          const result = isNaN(numValue) ? null : numValue;
          console.log(`→ Numeric conversion result: ${result}`);
          return result;
        }
        
        console.log(`→ Keeping as: ${value}`);
        return value;
      };

      // Step 3: Handle tarifa with detailed validation
      console.log("💰 Processing tarifa...");
      let tarifaValue: number;
      const rawTarifa = data.tarifa;
      
      console.log("Raw tarifa value:", rawTarifa, "type:", typeof rawTarifa);
      
      if (rawTarifa === null || rawTarifa === undefined || rawTarifa === '') {
        console.error("❌ Tarifa is required but empty");
        throw new Error("La tarifa es requerida");
      }
      
      // Convert to number if it's a string
      if (typeof rawTarifa === 'string') {
        const cleanedTarifa = rawTarifa.replace(/[^\d.,]/g, '').replace(',', '.');
        console.log("Cleaned tarifa string:", cleanedTarifa);
        tarifaValue = parseFloat(cleanedTarifa);
      } else {
        tarifaValue = Number(rawTarifa);
      }
      
      // Validate the number
      if (isNaN(tarifaValue) || tarifaValue <= 0) {
        console.error("❌ Invalid tarifa value:", tarifaValue);
        throw new Error("La tarifa debe ser un número válido mayor a 0");
      }
      console.log("✅ Tarifa validated:", tarifaValue);

      // Step 4: Handle cantidad_cargas
      console.log("📊 Processing cantidad_cargas...");
      let cantidadCargasValue: number = 1;
      if (data.cantidad_cargas !== null && data.cantidad_cargas !== undefined && data.cantidad_cargas !== '') {
        cantidadCargasValue = Number(data.cantidad_cargas);
        if (isNaN(cantidadCargasValue) || cantidadCargasValue < 1) {
          console.log("⚠️ Invalid cantidad_cargas, defaulting to 1");
          cantidadCargasValue = 1;
        }
      }
      console.log("✅ Cantidad cargas:", cantidadCargasValue);

      // Step 5: Process coordinates
      console.log("🗺️ Processing coordinates...");
      const origenLat = sanitizeValue(data.origen_lat, true);
      const origenLng = sanitizeValue(data.origen_lng, true);
      const destinoLat = sanitizeValue(data.destino_lat, true);
      const destinoLng = sanitizeValue(data.destino_lng, true);
      
      console.log("Coordinates processed:", {
        origenLat,
        origenLng,
        destinoLat,
        destinoLng
      });

      // Step 6: Process dates
      console.log("📅 Processing dates...");
      let fechaCargaDesde: string;
      let fechaCargaHasta: string | null = null;

      try {
        if (!data.fecha_carga_desde) {
          throw new Error("La fecha de carga desde es requerida");
        }
        fechaCargaDesde = new Date(data.fecha_carga_desde).toISOString();
        console.log("✅ Fecha desde processed:", fechaCargaDesde);

        if (data.fecha_carga_hasta) {
          fechaCargaHasta = new Date(data.fecha_carga_hasta).toISOString();
          console.log("✅ Fecha hasta processed:", fechaCargaHasta);
        }
      } catch (dateError) {
        console.error("❌ Date processing error:", dateError);
        throw new Error("Error en el formato de fechas");
      }

      // Step 7: Create clean data object
      console.log("📋 Creating clean data object...");
      const cleanedData = {
        origen: data.origen || null,
        origen_detalle: sanitizeValue(data.origen_detalle),
        origen_provincia: sanitizeValue(data.origen_provincia),
        origen_ciudad: sanitizeValue(data.origen_ciudad),
        destino: data.destino || null,
        destino_detalle: sanitizeValue(data.destino_detalle),
        destino_provincia: sanitizeValue(data.destino_provincia),
        destino_ciudad: sanitizeValue(data.destino_ciudad),
        fecha_carga_desde: fechaCargaDesde,
        fecha_carga_hasta: fechaCargaHasta,
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

      console.log("📦 Final cleaned data:", cleanedData);
      
      // Step 8: Validate required fields
      console.log("✅ Validating required fields...");
      const requiredFields = [
        { field: 'origen', value: cleanedData.origen, name: 'origen' },
        { field: 'destino', value: cleanedData.destino, name: 'destino' },
        { field: 'tipo_carga', value: cleanedData.tipo_carga, name: 'tipo de carga' },
        { field: 'tipo_camion', value: cleanedData.tipo_camion, name: 'tipo de camión' }
      ];

      for (const { field, value, name } of requiredFields) {
        if (!value) {
          console.error(`❌ Missing required field: ${field}`);
          throw new Error(`El ${name} es requerido`);
        }
        console.log(`✅ ${field} is valid:`, value);
      }

      // Step 9: Database insertion with timeout
      console.log("💾 Inserting into database...");
      
      const insertPromise = supabase.from("cargas").insert(cleanedData);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("La operación tardó demasiado tiempo")), 30000);
      });

      const { error } = await Promise.race([insertPromise, timeoutPromise]) as any;

      if (error) {
        console.error("❌ Database insertion error:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Error al publicar carga: ${error.message}`);
      }

      console.log("🎉 Cargo submitted successfully!");
      
    } catch (error: any) {
      console.error("💥 Error in submitCargo:", error);
      console.error("Error stack:", error.stack);
      throw error;
    }
  };

  return { submitCargo };
};
