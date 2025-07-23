
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
        setError(null);
        console.log(`[useApiConfiguration] Fetching config for: ${configKey}`);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Configuration fetch timeout')), 10000);
        });

        const fetchPromise = supabase
          .from('api_configurations')
          .select('*')
          .eq('key', configKey)
          .maybeSingle();

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        console.log(`[useApiConfiguration] Result for ${configKey}:`, { hasData: !!data, error });

        if (error) {
          console.error(`[useApiConfiguration] Error for ${configKey}:`, error);
          setError(error);
          setConfig(null);
          return;
        }

        if (data) {
          setConfig({
            key: data.key,
            value: data.value,
            url: data.url
          });
          console.log(`[useApiConfiguration] Config loaded for ${configKey}:`, {
            hasValue: !!data.value,
            valueLength: data.value ? data.value.length : 0
          });
        } else {
          console.warn(`[useApiConfiguration] No config found for: ${configKey}`);
          setConfig(null);
        }
      } catch (err: any) {
        console.error(`[useApiConfiguration] Error for ${configKey}:`, err);
        setError(err);
        setConfig(null);
        
        // Only show toast for timeout errors
        if (err.message?.includes('timeout')) {
          toast({
            title: "Error de configuración",
            description: `Tiempo de espera agotado para ${configKey}`,
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [configKey, toast]);

  return { config, loading, error };
};
