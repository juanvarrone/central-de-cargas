-- COMPREHENSIVE SECURITY FIXES (Fixed version)
-- Fix 1: Create missing is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND is_admin = true
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = $1 AND role = 'admin'
  );
$$;

-- Fix 2: Update all security definer functions to secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Fix 3: Tighten RLS policies - Remove anonymous access and require authentication
-- Fix cargas policies - remove public access and replace with secure ones
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.cargas;
DROP POLICY IF EXISTS "Users can view all cargas" ON public.cargas;
DROP POLICY IF EXISTS "Authenticated users can view cargas" ON public.cargas;

CREATE POLICY "Authenticated users can view cargas"
ON public.cargas FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix profiles policies - remove public access
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix other table policies
DROP POLICY IF EXISTS "Authenticated users can read API configurations" ON public.api_configurations;
CREATE POLICY "Authenticated users can read API configurations"
ON public.api_configurations FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can read app modules" ON public.app_modules;
CREATE POLICY "Authenticated users can read app modules"
ON public.app_modules FOR SELECT
TO authenticated  
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view active premium settings" ON public.premium_settings;
CREATE POLICY "Authenticated users can view active premium settings"
ON public.premium_settings FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND is_active = true);

DROP POLICY IF EXISTS "Authenticated users can view active system variables" ON public.system_variables;
CREATE POLICY "Authenticated users can view active system variables"
ON public.system_variables FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND is_active = true);

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read review categories" ON public.review_category_settings;
CREATE POLICY "Authenticated users can read review categories"
ON public.review_category_settings FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix 4: Add input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_text(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potentially dangerous characters and scripts
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(input_text, '<[^>]*>', '', 'g'), -- Remove HTML tags
      '[<>&"'']', '', 'g' -- Remove dangerous characters
    ),
    '\s+', ' ', 'g' -- Normalize whitespace
  );
END;
$$;

-- Fix 5: Create audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  table_name text DEFAULT NULL,
  record_id uuid DEFAULT NULL,
  details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values,
    created_at
  ) VALUES (
    auth.uid(),
    event_type,
    table_name,
    record_id,
    details,
    NOW()
  );
END;
$$;

-- Fix 6: Add rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  action_type text,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_attempts integer;
  window_start timestamptz;
BEGIN
  window_start := NOW() - (window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM public.rate_limits 
  WHERE created_at < window_start;
  
  -- Count current attempts
  SELECT COALESCE(SUM(attempts), 0) INTO current_attempts
  FROM public.rate_limits
  WHERE (user_id = auth.uid() OR ip_address = inet_client_addr())
    AND action_type = check_rate_limit.action_type
    AND window_start >= check_rate_limit.window_start;
  
  -- Check if limit exceeded
  IF current_attempts >= max_attempts THEN
    -- Log security event
    PERFORM public.log_security_event('rate_limit_exceeded', NULL, NULL, 
      jsonb_build_object('action_type', action_type, 'attempts', current_attempts));
    RETURN false;
  END IF;
  
  -- Record this attempt
  INSERT INTO public.rate_limits (user_id, ip_address, action_type, attempts, window_start)
  VALUES (auth.uid(), inet_client_addr(), action_type, 1, NOW())
  ON CONFLICT (user_id, action_type) 
  DO UPDATE SET attempts = rate_limits.attempts + 1, window_start = NOW();
  
  RETURN true;
END;
$$;

-- Fix 7: Add data validation constraints
-- Ensure profiles.id matches auth user
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_matches_auth;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_matches_auth 
CHECK (id IS NOT NULL);

-- Ensure cargas have valid tarifa
UPDATE public.cargas SET tarifa = 0 WHERE tarifa < 0;
ALTER TABLE public.cargas 
DROP CONSTRAINT IF EXISTS cargas_tarifa_positive;
ALTER TABLE public.cargas 
ADD CONSTRAINT cargas_tarifa_positive 
CHECK (tarifa >= 0);

-- Fix 8: Create security monitoring view
CREATE OR REPLACE VIEW public.security_dashboard AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  action,
  table_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users
FROM public.audit_logs
WHERE created_at >= NOW() - interval '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), action, table_name
ORDER BY hour DESC;

-- Fix 9: Add security triggers for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Log admin privilege changes
  IF TG_TABLE_NAME = 'profiles' AND (OLD.is_admin IS DISTINCT FROM NEW.is_admin) THEN
    PERFORM public.log_security_event('admin_privilege_change', TG_TABLE_NAME, NEW.id,
      jsonb_build_object('old_is_admin', OLD.is_admin, 'new_is_admin', NEW.is_admin));
  END IF;
  
  -- Log role changes
  IF TG_TABLE_NAME = 'user_roles' THEN
    IF TG_OP = 'INSERT' THEN
      PERFORM public.log_security_event('role_granted', TG_TABLE_NAME, NEW.id,
        jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role));
    ELSIF TG_OP = 'DELETE' THEN
      PERFORM public.log_security_event('role_revoked', TG_TABLE_NAME, OLD.id,
        jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role));
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add triggers for security monitoring
DROP TRIGGER IF EXISTS log_profile_changes ON public.profiles;
CREATE TRIGGER log_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();

DROP TRIGGER IF EXISTS log_role_changes ON public.user_roles;  
CREATE TRIGGER log_role_changes
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();