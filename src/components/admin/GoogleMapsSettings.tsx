
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the type for the data structure returned from the database
interface ApiConfiguration {
  id: string;
  key: string;
  value?: string | null;
  name: string;
  description?: string | null;
  url?: string | null;
  created_at: string;
  updated_at: string;
}

const GoogleMapsSettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setLoading(true);
        console.log("Fetching Google Maps API Key configuration...");
        const { data, error } = await supabase
          .from("api_configurations")
          .select("*")
          .eq("key", "GOOGLE_MAPS_API_KEY")
          .maybeSingle();

        if (error) {
          console.error("Error fetching API key:", error);
          throw error;
        }
        
        console.log("API configuration data:", data);

        if (data) {
          const config = data as ApiConfiguration;
          setApiKey(config.value || ""); 
          setDescription(config.description || "");
          console.log("Loaded API key configuration:", {
            hasValue: !!config.value,
            valueLength: config.value ? config.value.length : 0
          });
        } else {
          console.log("No Google Maps API Key configuration found");
        }
      } catch (error: any) {
        console.error("Error al cargar la API key de Google Maps:", error);
        toast({
          title: "Error",
          description: `No se pudo cargar la configuración: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApiKey();
  }, [toast]);

  const testApiKey = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Ingrese una API key para probar",
        variant: "destructive",
      });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      
      // Test the API key by making a simple request to the Maps JavaScript API
      const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      
      const response = await fetch(testUrl, { method: 'HEAD' });
      
      if (response.ok) {
        setTestResult('success');
        toast({
          title: "API Key válida",
          description: "La API key de Google Maps funciona correctamente",
        });
      } else {
        setTestResult('error');
        toast({
          title: "API Key inválida",
          description: "La API key no es válida o no tiene los permisos necesarios",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error testing API key:", error);
      setTestResult('error');
      toast({
        title: "Error al probar API Key",
        description: "No se pudo verificar la API key",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "La API key es requerida",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      console.log("Saving API key configuration...");
      
      // Verificar si ya existe la configuración
      const { data: existingConfig, error: checkError } = await supabase
        .from("api_configurations")
        .select("id")
        .eq("key", "GOOGLE_MAPS_API_KEY")
        .maybeSingle();

      if (checkError) throw checkError;

      // Actualizar o insertar según corresponda
      if (existingConfig) {
        console.log("Updating existing configuration with ID:", existingConfig.id);
        const { error: updateError } = await supabase
          .from("api_configurations")
          .update({
            value: apiKey,
            description: description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingConfig.id);

        if (updateError) throw updateError;
      } else {
        console.log("Creating new configuration");
        const { error: insertError } = await supabase
          .from("api_configurations")
          .insert({
            key: "GOOGLE_MAPS_API_KEY",
            value: apiKey,
            name: "Google Maps API Key",
            description: description,
            url: "https://maps.googleapis.com/maps/api/js",
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Configuración guardada",
        description: "La API key de Google Maps se ha actualizado correctamente",
      });
      
      // Test the API key after saving
      setTimeout(() => testApiKey(), 1000);
    } catch (error: any) {
      console.error("Error al guardar la API key:", error);
      toast({
        title: "Error",
        description: `No se pudo guardar la configuración: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isValidApiKeyFormat = (key: string) => {
    return key.length > 30 && key.startsWith('AIza');
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Configuración de Google Maps</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Para obtener una API key de Google Maps, visite la{" "}
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  Google Cloud Console <ExternalLink className="h-3 w-3 ml-1" />
                </a>
                {" "}y habilite las APIs: "Maps JavaScript API" y "Places API".
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key de Google Maps</Label>
              <div className="space-y-2">
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="AIzaSy..."
                  type="password"
                />
                {apiKey && !isValidApiKeyFormat(apiKey) && (
                  <p className="text-sm text-yellow-600">
                    ⚠️ Formato de API key inusual. Las API keys de Google generalmente empiezan con "AIza".
                  </p>
                )}
                {apiKey && isValidApiKeyFormat(apiKey) && (
                  <p className="text-sm text-green-600">
                    ✓ Formato de API key válido
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción o notas sobre esta API key"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={saving || !apiKey}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar configuración"
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={testApiKey} 
                disabled={testing || !apiKey}
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Probando...
                  </>
                ) : (
                  "Probar API Key"
                )}
              </Button>
            </div>

            {testResult && (
              <Alert variant={testResult === 'success' ? 'default' : 'destructive'}>
                {testResult === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {testResult === 'success' 
                    ? "✓ API Key válida y funcionando correctamente"
                    : "✗ API Key inválida o sin permisos suficientes"
                  }
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground space-y-2">
              <p><strong>Requisitos importantes:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Habilitar "Maps JavaScript API" en Google Cloud Console</li>
                <li>Habilitar "Places API" en Google Cloud Console</li>
                <li>Configurar restricciones de dominio si es necesario</li>
                <li>Verificar que la facturación esté habilitada en Google Cloud</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleMapsSettings;
