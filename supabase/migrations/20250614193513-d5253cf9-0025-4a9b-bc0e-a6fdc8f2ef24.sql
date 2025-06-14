
-- Función para crear notificaciones cuando hay nueva postulación
CREATE OR REPLACE FUNCTION notify_new_postulacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar al dador de carga sobre nueva postulación
  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT 
    c.usuario_id,
    'new_postulacion',
    'Nueva postulación recibida',
    'Un transportista se ha postulado para tu carga.',
    '/ver-carga/' || NEW.carga_id
  FROM public.cargas c
  WHERE c.id = NEW.carga_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para nueva postulación
CREATE TRIGGER trigger_notify_new_postulacion
  AFTER INSERT ON public.cargas_postulaciones
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_postulacion();

-- Función para notificar sobre cargas coincidentes con alertas
CREATE OR REPLACE FUNCTION check_cargo_alerts()
RETURNS TRIGGER AS $$
DECLARE
  alert_record RECORD;
  distance_km NUMERIC;
BEGIN
  -- Solo verificar si la carga está disponible
  IF NEW.estado = 'disponible' THEN
    -- Buscar alertas que coincidan con la nueva carga
    FOR alert_record IN 
      SELECT ua.*, p.user_type
      FROM public.user_alerts ua
      JOIN public.profiles p ON p.id = ua.user_id
      WHERE ua.notify_new_loads = true
        AND p.user_type = 'camionero'
        AND (ua.date_from IS NULL OR ua.date_from <= NEW.fecha_carga_desde)
        AND (ua.date_to IS NULL OR ua.date_to >= NEW.fecha_carga_desde)
    LOOP
      -- Verificar si alguna ubicación de la alerta está dentro del radio
      SELECT INTO distance_km
        LEAST(
          ST_Distance(
            ST_Point(NEW.origen_lng, NEW.origen_lat)::geography,
            ST_Point(split_part(unnest(alert_record.locations), ',', 2)::numeric, 
                    split_part(unnest(alert_record.locations), ',', 1)::numeric)::geography
          ) / 1000,
          ST_Distance(
            ST_Point(NEW.destino_lng, NEW.destino_lat)::geography,
            ST_Point(split_part(unnest(alert_record.locations), ',', 2)::numeric, 
                    split_part(unnest(alert_record.locations), ',', 1)::numeric)::geography
          ) / 1000
        );
      
      -- Si está dentro del radio, crear notificación
      IF distance_km <= alert_record.radius_km THEN
        INSERT INTO public.notifications (user_id, type, title, message, link)
        VALUES (
          alert_record.user_id,
          'alert_match',
          'Nueva carga coincidente',
          'Hay una nueva carga que coincide con tu alerta "' || alert_record.name || '"',
          '/ver-carga/' || NEW.id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para verificar alertas de cargas
CREATE TRIGGER trigger_check_cargo_alerts
  AFTER INSERT ON public.cargas
  FOR EACH ROW
  EXECUTE FUNCTION check_cargo_alerts();

-- Función para notificar sobre camiones coincidentes con alertas
CREATE OR REPLACE FUNCTION check_truck_alerts()
RETURNS TRIGGER AS $$
DECLARE
  alert_record RECORD;
  distance_km NUMERIC;
BEGIN
  -- Solo verificar si el camión está disponible
  IF NEW.estado = 'disponible' THEN
    -- Buscar alertas que coincidan con el nuevo camión disponible
    FOR alert_record IN 
      SELECT ua.*, p.user_type
      FROM public.user_alerts ua
      JOIN public.profiles p ON p.id = ua.user_id
      WHERE ua.notify_available_trucks = true
        AND p.user_type = 'dador'
        AND (ua.date_from IS NULL OR ua.date_from <= NEW.fecha_disponible_desde)
        AND (ua.date_to IS NULL OR ua.date_to >= COALESCE(NEW.fecha_disponible_hasta, NEW.fecha_disponible_desde))
    LOOP
      -- Verificar si alguna ubicación de la alerta está dentro del radio
      SELECT INTO distance_km
        LEAST(
          ST_Distance(
            ST_Point(NEW.origen_lng, NEW.origen_lat)::geography,
            ST_Point(split_part(unnest(alert_record.locations), ',', 2)::numeric, 
                    split_part(unnest(alert_record.locations), ',', 1)::numeric)::geography
          ) / 1000,
          ST_Distance(
            ST_Point(NEW.destino_lng, NEW.destino_lat)::geography,
            ST_Point(split_part(unnest(alert_record.locations), ',', 2)::numeric, 
                    split_part(unnest(alert_record.locations), ',', 1)::numeric)::geography
          ) / 1000
        );
      
      -- Si está dentro del radio, crear notificación
      IF distance_km <= alert_record.radius_km THEN
        INSERT INTO public.notifications (user_id, type, title, message, link)
        VALUES (
          alert_record.user_id,
          'alert_truck_match',
          'Nuevo camión disponible',
          'Hay un camión disponible que coincide con tu alerta "' || alert_record.name || '"',
          '/buscar-camiones'
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para verificar alertas de camiones
CREATE TRIGGER trigger_check_truck_alerts
  AFTER INSERT ON public.camiones_disponibles
  FOR EACH ROW
  EXECUTE FUNCTION check_truck_alerts();

-- Habilitar extensión PostGIS si no está habilitada (para cálculos de distancia)
CREATE EXTENSION IF NOT EXISTS postgis;
