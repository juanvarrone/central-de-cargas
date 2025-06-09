
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingReview {
  cargaId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  reviewerType: 'dador' | 'camionero';
  fechaCarga: string;
}

export const useReviewNotifications = () => {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkPendingReviews();
  }, []);

  const checkPendingReviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile to determine user type
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const currentDate = new Date();
      const oneDayAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

      // Query for completed cargas that need reviews
      let query = supabase
        .from('cargas')
        .select(`
          id,
          fecha_carga_desde,
          fecha_carga_hasta,
          estado,
          usuario_id,
          postulacion_asignada_id,
          profiles!cargas_usuario_id_fkey(full_name, user_type)
        `)
        .eq('estado', 'completada');

      // Add filter based on user type
      if (profile.user_type === 'dador') {
        query = query.eq('usuario_id', user.id);
      } else {
        // For transportistas, get cargas where they were assigned
        const { data: postulaciones } = await supabase
          .from('cargas_postulaciones')
          .select('carga_id')
          .eq('usuario_id', user.id);

        if (postulaciones && postulaciones.length > 0) {
          const cargaIds = postulaciones.map(p => p.carga_id);
          query = query.in('id', cargaIds);
        } else {
          setLoading(false);
          return;
        }
      }

      const { data: completedCargas, error } = await query;

      if (error) throw error;

      if (!completedCargas) {
        setLoading(false);
        return;
      }

      // Filter cargas that are past their completion date and haven't been reviewed
      const pending: PendingReview[] = [];

      for (const carga of completedCargas) {
        const endDate = carga.fecha_carga_hasta 
          ? new Date(carga.fecha_carga_hasta)
          : new Date(carga.fecha_carga_desde);

        // Check if the carga completion date has passed
        if (endDate < oneDayAgo) {
          // Check if user has already reviewed this carga
          const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('reviewer_id', user.id)
            .eq('carga_id', carga.id)
            .single();

          if (!existingReview) {
            // Determine who to review based on user type
            let reviewedUserId: string;
            let reviewedUserName: string;
            let reviewerType: 'dador' | 'camionero';

            if (profile.user_type === 'dador') {
              // Dador reviews transportista
              if (carga.postulacion_asignada_id) {
                const { data: postulacion } = await supabase
                  .from('cargas_postulaciones')
                  .select(`
                    usuario_id,
                    profiles!cargas_postulaciones_usuario_id_fkey(full_name)
                  `)
                  .eq('id', carga.postulacion_asignada_id)
                  .single();

                if (postulacion) {
                  reviewedUserId = postulacion.usuario_id;
                  reviewedUserName = (postulacion.profiles as any)?.full_name || 'Transportista';
                  reviewerType = 'dador';
                } else {
                  continue;
                }
              } else {
                continue;
              }
            } else {
              // Transportista reviews dador
              reviewedUserId = carga.usuario_id;
              reviewedUserName = (carga.profiles as any)?.full_name || 'Dador de carga';
              reviewerType = 'camionero';
            }

            pending.push({
              cargaId: carga.id,
              reviewedUserId,
              reviewedUserName,
              reviewerType,
              fechaCarga: carga.fecha_carga_desde
            });
          }
        }
      }

      setPendingReviews(pending);

      // Show notification if there are pending reviews
      if (pending.length > 0) {
        toast({
          title: "Calificaciones pendientes",
          description: `Tienes ${pending.length} ${pending.length === 1 ? 'calificación pendiente' : 'calificaciones pendientes'}`,
        });
      }

    } catch (error: any) {
      console.error('Error checking pending reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const markReviewCompleted = (cargaId: string) => {
    setPendingReviews(prev => prev.filter(review => review.cargaId !== cargaId));
  };

  return {
    pendingReviews,
    loading,
    markReviewCompleted,
    refetch: checkPendingReviews
  };
};
