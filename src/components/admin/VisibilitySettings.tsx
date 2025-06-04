
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface VisibilityConfig {
  cargas_extra_days: number;
  camiones_extra_days: number;
}

const VisibilitySettings = () => {
  const [config, setConfig] = useState<VisibilityConfig>({
    cargas_extra_days: 30,
    camiones_extra_days: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("system_variables")
        .select("name, value")
        .in("name", ["cargas_extra_days", "camiones_extra_days"])
        .eq("is_active", true);

      if (error) throw error;

      const configMap: Partial<VisibilityConfig> = {};
      data?.forEach((item) => {
        const key = item.name as keyof VisibilityConfig;
        configMap[key] = parseInt(item.value) || 30;
      });

      setConfig({
        cargas_extra_days: configMap.cargas_extra_days || 30,
        camiones_extra_days: configMap.camiones_extra_days || 30
      });
    } catch (error: any) {
      console.error("Error fetching visibility settings:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de visibilidad",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update or insert settings
      const updates = [
        {
          name: "cargas_extra_days",
          value: config.cargas_extra_days.toString(),
          category: "visibilidad",
          description: "Días extras que las cargas permanecen visibles después de su fecha límite"
        },
        {
          name: "camiones_extra_days", 
          value: config.camiones_extra_days.toString(),
          category: "visibilidad",
          description: "Días extras que los camiones permanecen visibles después de su fecha límite"
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from("system_variables")
          .upsert({
            name: update.name,
            value: update.value,
            category: update.category,
            description: update.description,
            is_active: true
          }, {
            onConflict: "name"
          });

        if (error) throw error;
      }

      toast({
        title: "Configuración guardada",
        description: "Las configuraciones de visibilidad se han guardado correctamente",
      });
    } catch (error: any) {
      console.error("Error saving visibility settings:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof VisibilityConfig, value: string) => {
    const numValue = parseInt(value) || 0;
    setConfig(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Visibilidad</CardTitle>
        <CardDescription>
          Define cuántos días extra permanecen visibles las cargas y camiones después de su fecha límite
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cargas-extra-days">Días extras para cargas</Label>
            <Input
              id="cargas-extra-days"
              type="number"
              min="0"
              max="365"
              value={config.cargas_extra_days}
              onChange={(e) => handleInputChange("cargas_extra_days", e.target.value)}
              placeholder="30"
            />
            <p className="text-sm text-muted-foreground">
              Las cargas permanecerán visibles este número de días después de su fecha límite
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="camiones-extra-days">Días extras para camiones</Label>
            <Input
              id="camiones-extra-days"
              type="number"
              min="0"
              max="365"
              value={config.camiones_extra_days}
              onChange={(e) => handleInputChange("camiones_extra_days", e.target.value)}
              placeholder="30"
            />
            <p className="text-sm text-muted-foreground">
              Los camiones permanecerán visibles este número de días después de su fecha límite
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisibilitySettings;
