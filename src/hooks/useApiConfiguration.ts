
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiConfig {
  key: string;
  value: string | null;
  url?: string | null;
}

export const useApiConfiguration = (configKey: string) => {
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        console.log(`Fetching API configuration for key: ${configKey}`);
        
        // With RLS policies now in place, all users can read API configurations
        const { data, error } = await supabase
          .from('api_configurations')
          .select('*')
          .eq('key', configKey)
          .maybeSingle();

        console.log(`Query result for ${configKey}:`, { data, error });

        if (error) {
          console.error(`Error fetching configuration for ${configKey}:`, error);
          throw error;
        }

        console.log(`Config data for ${configKey}:`, data);
        
        if (data) {
          setConfig({
            key: data.key,
            value: data.value, // Using the value field for the API key
            url: data.url
          });
          console.log(`Configuration loaded for ${configKey}, value present:`, !!data.value);
        } else {
          console.warn(`No configuration found for key: ${configKey}`);
        }
      } catch (err: any) {
        console.error(`Error getting API configuration ${configKey}:`, err);
        setError(err);
        toast({
          title: "Error",
          description: `No se pudo cargar la configuración: ${err.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [configKey, toast]);

  return { config, loading, error };
};
