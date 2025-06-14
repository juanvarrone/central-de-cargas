
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to send notification when carga is assigned
CREATE OR REPLACE FUNCTION notify_carga_assignment()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for carga assignment notifications
CREATE TRIGGER trigger_notify_carga_assignment
  AFTER UPDATE ON public.cargas
  FOR EACH ROW
  EXECUTE FUNCTION notify_carga_assignment();
