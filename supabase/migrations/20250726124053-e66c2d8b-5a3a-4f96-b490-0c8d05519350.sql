-- Fix remaining security issues (excluding system tables we don't own)

-- 1. Remove anonymous access from policies that shouldn't allow it
-- Fix API configurations - should only be readable by authenticated users, not anonymous
DROP POLICY IF EXISTS "Anyone can read API configurations" ON public.api_configurations;
CREATE POLICY "Authenticated users can read API configurations" ON public.api_configurations
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix app modules - remove anonymous access
DROP POLICY IF EXISTS "Allow read access for all authenticated users on app_modules" ON public.app_modules;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.app_modules;
CREATE POLICY "Authenticated users can read app modules" ON public.app_modules
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Fix premium settings - remove anonymous access  
DROP POLICY IF EXISTS "All users can view active premium settings" ON public.premium_settings;
CREATE POLICY "Authenticated users can view active premium settings" ON public.premium_settings
FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- Fix system variables - remove anonymous access
DROP POLICY IF EXISTS "All users can view active system variables" ON public.system_variables;
CREATE POLICY "Authenticated users can view active system variables" ON public.system_variables
FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- Fix user roles - remove broad anonymous access
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Fix review category settings - remove anonymous access
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON public.review_category_settings;
CREATE POLICY "Authenticated users can read review categories" ON public.review_category_settings
FOR SELECT USING (auth.uid() IS NOT NULL);

-- 2. Add input validation functions for user content
CREATE OR REPLACE FUNCTION public.sanitize_text(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Basic input sanitization - remove potentially dangerous characters
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Remove potential HTML/script tags and limit length
    RETURN TRIM(
        REGEXP_REPLACE(
            SUBSTRING(input_text FROM 1 FOR 10000), 
            '<[^>]*>', 
            '', 
            'g'
        )
    );
END;
$$;

-- 3. Create security monitoring views for admins
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    action,
    table_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
FROM public.audit_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), action, table_name
ORDER BY hour DESC;

-- 4. Create rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action_type TEXT NOT NULL,
    ip_address INET,
    attempts INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow system/admin access to rate limits
CREATE POLICY "Only admins can manage rate limits" ON public.rate_limits
FOR ALL USING (public.is_admin(auth.uid()));

-- 5. Add constraints for data integrity
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS valid_user_type 
CHECK (user_type IN ('dador', 'camionero') OR user_type IS NULL);

ALTER TABLE public.cargas 
ADD CONSTRAINT IF NOT EXISTS valid_estado 
CHECK (estado IN ('disponible', 'asignada', 'completada', 'cancelada'));

ALTER TABLE public.camiones_disponibles 
ADD CONSTRAINT IF NOT EXISTS valid_truck_estado 
CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento'));

-- Ensure critical fields are not empty when they should have values
ALTER TABLE public.cargas 
ADD CONSTRAINT IF NOT EXISTS tarifa_positive 
CHECK (tarifa > 0);

ALTER TABLE public.cargas 
ADD CONSTRAINT IF NOT EXISTS valid_dates 
CHECK (fecha_carga_desde <= COALESCE(fecha_carga_hasta, fecha_carga_desde));

-- 6. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type TEXT,
    p_details JSONB DEFAULT NULL,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id, 
        action, 
        table_name, 
        new_values
    ) VALUES (
        p_user_id,
        'SECURITY_EVENT',
        p_event_type,
        p_details
    );
END;
$$;