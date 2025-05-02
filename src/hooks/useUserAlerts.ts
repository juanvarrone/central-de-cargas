
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserAlert {
  id: string;
  user_id: string;
  name: string;
  locations: string[];
  radius_km: number;
  date_from: string | null;
  date_to: string | null;
  notify_new_loads: boolean;
  notify_available_trucks: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserAlerts = () => {
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      // Get user type from profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();
        
      if (profileData) {
        setUserType(profileData.user_type);
      }

      const { data, error } = await supabase
        .from("user_alerts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data as UserAlert[]);
    } catch (error: any) {
      setError(error);
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const createAlert = useMutation({
    mutationFn: async (alert: Omit<UserAlert, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("user_alerts").insert({
        ...alert,
        user_id: session.user.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      fetchAlerts();
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    }
  });

  const updateAlert = useMutation({
    mutationFn: async (alert: UserAlert) => {
      const { id, user_id, created_at, updated_at, ...updateData } = alert;
      const { error } = await supabase
        .from("user_alerts")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      fetchAlerts();
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    }
  });

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      fetchAlerts();
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    }
  });

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    isLoading: loading,
    isCreating: createAlert.isPending,
    isEditing: updateAlert.isPending,
    isDeleting: deleteAlert.isPending,
    isCamionero: userType === "camionero",
    isDador: userType === "dador"
  };
};
