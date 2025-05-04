import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiConfig {
  id: string;
  key: string;
  name: string;
  url: string | null;
  description: string | null;
  is_active?: boolean;
}

const ApiConfiguration = () => {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newConfig, setNewConfig] = useState<Partial<ApiConfig>>({
    key: "",
    name: "",
    url: "",
    description: "",
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchApiConfigs();
  }, []);

  const fetchApiConfigs = async () => {
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setNewConfig({ ...newConfig, [field]: value });
  };

  const handleSaveConfig = async () => {
    if (!newConfig.key || !newConfig.name) {
      toast({
        title: "Campos requeridos",
        description: "La clave y el nombre son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("api_configurations")
        .insert({
          key: newConfig.key,
          name: newConfig.name,
          url: newConfig.url || null,
          description: newConfig.description || null
        })
        .select();

      if (error) throw error;

      setConfigs([...configs, data[0] as ApiConfig]);
      setNewConfig({
        key: "",
        name: "",
        url: "",
        description: "",
        is_active: true
      });
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

  const handleUpdateConfig = async (id: string, field: string, value: any) => {
    try {
      // Find the config in the state and update it
      const updatedConfigs = configs.map(config => 
        config.id === id ? { ...config, [field]: value } : config
      );
      setConfigs(updatedConfigs);
      
      // Update in the database
      const { error } = await supabase
        .from("api_configurations")
        .update({ [field]: value })
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Configuración actualizada",
        description: `El campo ${field} ha sido actualizado exitosamente`
      });
    } catch (error: any) {
      console.error("Error updating API configuration:", error);
      toast({
        title: "Error",
        description: `No se pudo actualizar la configuración: ${error.message}`,
        variant: "destructive"
      });
      
      // Revert the change in UI if the database update failed
      fetchApiConfigs();
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
      {/* Add New API Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar nueva API o Token</CardTitle>
          <CardDescription>
            Configure APIs externas y tokens de autenticación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Ej: Google Maps API"
                value={newConfig.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">Clave</Label>
              <Input
                id="key"
                placeholder="Ej: GOOGLE_MAPS_API_KEY"
                value={newConfig.key}
                onChange={(e) => handleInputChange("key", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL (opcional)</Label>
              <Input
                id="url"
                placeholder="Ej: https://maps.googleapis.com/maps/api/js"
                value={newConfig.url || ""}
                onChange={(e) => handleInputChange("url", e.target.value)}
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descripción adicional"
                value={newConfig.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={2}
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

      {/* Existing API Configurations */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configuraciones existentes</h3>
        {configs.length === 0 ? (
          <p className="text-muted-foreground">No hay configuraciones de API guardadas todavía.</p>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <Card key={config.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{config.name}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => handleDeleteConfig(config.id, config.name)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="font-mono text-xs bg-muted p-1 rounded">
                    {config.key}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${config.id}`}>Nombre</Label>
                    <Input
                      id={`name-${config.id}`}
                      value={config.name}
                      onChange={(e) => handleUpdateConfig(config.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`key-${config.id}`}>Clave</Label>
                    <Input
                      id={`key-${config.id}`}
                      value={config.key}
                      onChange={(e) => handleUpdateConfig(config.id, "key", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`url-${config.id}`}>URL</Label>
                    <Input
                      id={`url-${config.id}`}
                      value={config.url || ""}
                      onChange={(e) => handleUpdateConfig(config.id, "url", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${config.id}`}>Descripción</Label>
                    <Textarea
                      id={`description-${config.id}`}
                      value={config.description || ""}
                      onChange={(e) => handleUpdateConfig(config.id, "description", e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiConfiguration;
