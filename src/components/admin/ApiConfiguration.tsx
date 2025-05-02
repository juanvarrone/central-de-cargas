
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Key, Link, Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiConfig {
  id: string;
  name: string;
  key: string;
  url?: string;
  description?: string;
}

const ApiConfiguration = () => {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<ApiConfig>>({
    name: "",
    key: "",
    url: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("api_configurations")
        .select("*")
        .order("name");

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      console.error("Error fetching API configurations:", error);
      toast({
        title: "Error",
        description: `No se pudieron cargar las configuraciones: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewConfig({ ...newConfig, [field]: value });
  };

  const handleSaveConfig = async () => {
    if (!newConfig.name || !newConfig.key) {
      toast({
        title: "Campos requeridos",
        description: "El nombre y la clave son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("api_configurations")
        .insert({
          name: newConfig.name,
          key: newConfig.key,
          url: newConfig.url,
          description: newConfig.description
        })
        .select();

      if (error) throw error;

      setConfigs([...configs, data[0]]);
      setNewConfig({ name: "", key: "", url: "", description: "" });
      toast({
        title: "Configuración guardada",
        description: `La configuración ${newConfig.name} ha sido guardada exitosamente`
      });
    } catch (error: any) {
      console.error("Error saving API configuration:", error);
      toast({
        title: "Error",
        description: `No se pudo guardar la configuración: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfig = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro que desea eliminar la configuración "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("api_configurations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setConfigs(configs.filter(config => config.id !== id));
      toast({
        title: "Configuración eliminada",
        description: `La configuración "${name}" ha sido eliminada`
      });
    } catch (error: any) {
      console.error("Error deleting API configuration:", error);
      toast({
        title: "Error",
        description: `No se pudo eliminar la configuración: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agregar nueva configuración de API</CardTitle>
          <CardDescription>
            Ingrese los detalles de la API que desea configurar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Google Maps API"
                value={newConfig.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">Clave API</Label>
              <Input
                id="key"
                placeholder="API_KEY_HERE"
                value={newConfig.key}
                onChange={(e) => handleInputChange("key", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL (opcional)</Label>
              <Input
                id="url"
                placeholder="https://api.example.com"
                value={newConfig.url || ""}
                onChange={(e) => handleInputChange("url", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                placeholder="Utilizada para geocodificación"
                value={newConfig.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSaveConfig} 
            disabled={saving}
            className="ml-auto"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">APIs Configuradas</h3>
        {configs.length === 0 ? (
          <p className="text-muted-foreground">No hay APIs configuradas todavía.</p>
        ) : (
          configs.map((config) => (
            <Card key={config.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => handleDeleteConfig(config.id, config.name)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {config.description && (
                  <CardDescription>{config.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm bg-muted p-1 rounded">
                    {config.key.substring(0, 4)}...{config.key.substring(config.key.length - 4)}
                  </span>
                </div>
                {config.url && (
                  <div className="flex items-center space-x-2">
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{config.url}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ApiConfiguration;
