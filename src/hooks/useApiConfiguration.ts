
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiConfig {
  key: string;
  value: string;
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
        
        const { data, error } = await supabase
          .from('api_configurations')
          .select('*')
          .eq('key', configKey)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setConfig({
            key: data.key,
            value: data.value || "", // Use the value field for the actual API key
            url: data.url
          });
        } else {
          console.warn(`No se encontró configuración para la clave: ${configKey}`);
        }
      } catch (err: any) {
        console.error(`Error al obtener configuración de API ${configKey}:`, err);
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
