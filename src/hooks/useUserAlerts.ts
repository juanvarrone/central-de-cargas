import { useState, useEffect } from "react";
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

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
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

  const insertAlert = async (alert: Omit<UserAlert, "id" | "user_id">) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("user_alerts").insert({
        ...alert,
        user_id: session.user.id
      });

      if (error) throw error;
      
      await fetchAlerts();
    } catch (error) {
      console.error("Error inserting alert:", error);
      throw error;
    }
  };

  const updateAlert = async (id: string, updates: Partial<UserAlert>) => {
    try {
      const { error } = await supabase
        .from("user_alerts")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      await fetchAlerts();
    } catch (error) {
      console.error("Error updating alert:", error);
      throw error;
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_alerts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchAlerts();
    } catch (error) {
      console.error("Error deleting alert:", error);
      throw error;
    }
  };

  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    insertAlert,
    updateAlert,
    deleteAlert,
  };
};
