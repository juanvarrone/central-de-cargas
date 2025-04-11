
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from '@/hooks/useUserProfile';

export interface UserAlert {
  id?: string;
  user_id?: string;
  name: string;
  locations: string[];
  date_from: string | null;
  date_to: string | null;
  radius_km: number;
  notify_new_loads: boolean;
  notify_available_trucks: boolean;
}

export const useUserAlerts = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useUserProfile();

  // Fetch the user's alerts
  const { 
    data: alerts, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserAlert[];
    },
    enabled: !!supabase.auth.getSession()
  });

  // Create a new alert
  const createAlert = useMutation({
    mutationFn: async (alert: Omit<UserAlert, 'id' | 'user_id'>) => {
      setIsCreating(true);
      const { data, error } = await supabase
        .from('user_alerts')
        .insert([alert])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-alerts'] });
      toast({
        title: "Alerta creada",
        description: "Tu alerta ha sido creada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la alerta",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCreating(false);
    }
  });

  // Update an existing alert
  const updateAlert = useMutation({
    mutationFn: async ({ id, ...alert }: UserAlert) => {
      setIsEditing(true);
      const { data, error } = await supabase
        .from('user_alerts')
        .update(alert)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-alerts'] });
      toast({
        title: "Alerta actualizada",
        description: "Tu alerta ha sido actualizada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la alerta",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsEditing(false);
    }
  });

  // Delete an alert
  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      setIsDeleting(true);
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-alerts'] });
      toast({
        title: "Alerta eliminada",
        description: "La alerta ha sido eliminada exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la alerta",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  // Check if user is camionero or dador
  const isCamionero = profile?.user_type === 'camionero';
  const isDador = profile?.user_type === 'dador';

  return {
    alerts,
    isLoading,
    error,
    isCreating,
    isEditing,
    isDeleting,
    createAlert,
    updateAlert,
    deleteAlert,
    refetch,
    isCamionero,
    isDador
  };
};
