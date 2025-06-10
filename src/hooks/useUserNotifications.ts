
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'cargo_assigned' | 'review_pending' | 'general';
  read: boolean;
  created_at: string;
  carga_id?: string;
  link?: string;
}

export const useUserNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;

    // For now, we'll simulate notifications based on cargas and postulaciones
    // In a real implementation, you would have a notifications table
    const { data: assignedCargas } = await supabase
      .from('cargas')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('estado', 'asignada');

    const { data: pendingReviews } = await supabase
      .from('cargas')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('estado', 'completada')
      .is('reviewed', null);

    const mockNotifications: Notification[] = [];

    // Add cargo assignment notifications
    assignedCargas?.forEach(carga => {
      mockNotifications.push({
        id: `cargo-${carga.id}`,
        title: 'Carga Asignada',
        message: `Su carga de ${carga.origen} a ${carga.destino} ha sido asignada`,
        type: 'cargo_assigned',
        read: false,
        created_at: carga.fecha_asignacion || carga.updated_at,
        carga_id: carga.id,
        link: `/ver-carga/${carga.id}`
      });
    });

    // Add review notifications
    pendingReviews?.forEach(carga => {
      mockNotifications.push({
        id: `review-${carga.id}`,
        title: 'Pendiente de Calificación',
        message: `Por favor califique al transportista de la carga ${carga.origen} - ${carga.destino}`,
        type: 'review_pending',
        read: false,
        created_at: carga.updated_at,
        carga_id: carga.id
      });
    });

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
