
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemConfig {
  cargas_extra_days: number;
  camiones_extra_days: number;
}

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>({
    cargas_extra_days: 30,
    camiones_extra_days: 30
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("system_variables")
          .select("name, value")
          .in("name", ["cargas_extra_days", "camiones_extra_days"])
          .eq("is_active", true);

        if (error) throw error;

        const configMap: Partial<SystemConfig> = {};
        data?.forEach((item) => {
          const key = item.name as keyof SystemConfig;
          configMap[key] = parseInt(item.value) || 30;
        });

        setConfig({
          cargas_extra_days: configMap.cargas_extra_days || 30,
          camiones_extra_days: configMap.camiones_extra_days || 30
        });
      } catch (error: any) {
        console.error("Error fetching system config:", error);
        // Use default values if fetch fails
        setConfig({
          cargas_extra_days: 30,
          camiones_extra_days: 30
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading };
};
