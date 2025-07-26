-- Fix critical security issues

-- 1. Create the missing is_admin function that's referenced in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = $1 
    AND ur.role = 'admin'
  ) OR EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = $1 
    AND p.is_admin = true
  );
$$;

-- 2. Fix search_path security issues in existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_carga_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create notification if postulacion_asignada_id was added/changed
  IF OLD.postulacion_asignada_id IS DISTINCT FROM NEW.postulacion_asignada_id 
     AND NEW.postulacion_asignada_id IS NOT NULL THEN
    
    -- Get the user_id from the assigned postulacion
    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT 
      cp.usuario_id,
      'carga_assigned',
      'Carga Asignada',
      'Te han asignado una carga. Haz clic para ver los detalles.',
      '/ver-carga/' || NEW.id
    FROM public.cargas_postulaciones cp
    WHERE cp.id = NEW.postulacion_asignada_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_postulacion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.check_cargo_alerts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.check_truck_alerts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 3. Tighten RLS policies - remove overly permissive anonymous access

-- Drop overly permissive policies and replace with secure ones
DROP POLICY IF EXISTS "Cargas are viewable by everyone." ON public.cargas;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view available trucks" ON public.camiones_disponibles;
DROP POLICY IF EXISTS "Cualquiera puede ver las reseñas" ON public.reviews;

-- Create secure policies that require authentication
CREATE POLICY "Authenticated users can view cargas" ON public.cargas
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view profiles" ON public.profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view available trucks" ON public.camiones_disponibles
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view reviews" ON public.reviews
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 4. Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
FOR SELECT USING (public.is_admin(auth.uid()));

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- Add audit triggers to critical tables
CREATE TRIGGER audit_cargas_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.cargas
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_user_roles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();