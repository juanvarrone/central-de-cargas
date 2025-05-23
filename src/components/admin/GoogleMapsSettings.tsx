
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setLoading(true);
        console.log("Fetching Google Maps API Key...");
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
          setApiKey(config.value || ""); // Use the value field for the API key
          setDescription(config.description || "");
          console.log("Loaded API key:", config.value);
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

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log("Saving API key:", apiKey);
      
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
            value: apiKey, // Guardar la API key en el campo value
            description: description,
          })
          .eq("id", existingConfig.id);

        if (updateError) throw updateError;
      } else {
        console.log("Creating new configuration");
        const { error: insertError } = await supabase
          .from("api_configurations")
          .insert({
            key: "GOOGLE_MAPS_API_KEY", // Este es el identificador
            value: apiKey, // Este es el valor real de la API key
            name: "Google Maps API Key", // Un nombre descriptivo
            description: description,
            url: "https://maps.googleapis.com/maps/api/js",
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Configuración guardada",
        description: "La API key de Google Maps se ha actualizado correctamente",
      });
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
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key de Google Maps</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingrese su API Key de Google Maps"
              />
              <p className="text-xs text-muted-foreground">
                Esta API key se almacena en la columna "value" de la tabla api_configurations.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción o notas sobre esta API key"
              />
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saving || !apiKey}
              className="mt-2"
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
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Una vez guardada, esta API key se utilizará en todos los componentes de mapas de la aplicación.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleMapsSettings;
