
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  is_active: boolean;
  description?: string;
}

const PremiumSettings = () => {
  const [settings, setSettings] = useState<PremiumSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const defaultSettings = [
    {
      setting_key: "banco",
      display_name: "Banco",
      description: "Nombre del banco para transferencias premium"
    },
    {
      setting_key: "alias",
      display_name: "Alias",
      description: "Alias para transferencias bancarias"
    },
    {
      setting_key: "cbu",
      display_name: "CBU",
      description: "CBU de la cuenta para transferencias"
    },
    {
      setting_key: "destinatario",
      display_name: "Destinatario",
      description: "Nombre del destinatario de transferencias"
    },
    {
      setting_key: "telefono_contacto",
      display_name: "Teléfono de contacto",
      description: "Teléfono para consultas sobre pagos"
    },
    {
      setting_key: "email_contacto",
      display_name: "Email de contacto",
      description: "Email para consultas sobre pagos"
    },
    {
      setting_key: "instrucciones_pago",
      display_name: "Instrucciones de pago",
      description: "Instrucciones adicionales para realizar el pago"
    },
    {
      setting_key: "precio_plan_mensual",
      display_name: "Precio plan mensual",
      description: "Valor del plan mensual en moneda local"
    },
    {
      setting_key: "precio_plan_anual",
      display_name: "Precio plan anual",
      description: "Valor del plan anual en moneda local"
    }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("premium_settings")
        .select("*")
        .order("setting_key");

      if (error) throw error;

      // If we have settings, use them, otherwise create defaults
      let settingsData = data || [];
      
      // Check which default settings are missing
      if (settingsData.length < defaultSettings.length) {
        const existingKeys = settingsData.map(s => s.setting_key);
        const missingSettings = defaultSettings
          .filter(ds => !existingKeys.includes(ds.setting_key))
          .map(ds => ({
            setting_key: ds.setting_key,
            setting_value: "",
            is_active: true,
            description: ds.description
          }));
        
        if (missingSettings.length > 0) {
          // Insert missing settings
          const { data: insertedData, error: insertError } = await supabase
            .from("premium_settings")
            .insert(missingSettings)
            .select();
            
          if (insertError) throw insertError;
          settingsData = [...settingsData, ...(insertedData || [])];
        }
      }
      
      setSettings(settingsData);
    } catch (error: any) {
      console.error("Error fetching premium settings:", error);
      toast({
        title: "Error",
        description: `No se pudieron cargar las configuraciones premium: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = (index: number) => {
    const updatedSettings = [...settings];
    updatedSettings[index].is_active = !updatedSettings[index].is_active;
    setSettings(updatedSettings);
  };

  const handleUpdateSetting = (index: number, value: string) => {
    const updatedSettings = [...settings];
    updatedSettings[index].setting_value = value;
    setSettings(updatedSettings);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Update all settings in a batch
      const updates = settings.map(setting => ({
        id: setting.id,
        setting_value: setting.setting_value,
        is_active: setting.is_active
      }));
      
      const { error } = await supabase.from("premium_settings").upsert(updates);
      
      if (error) throw error;
      
      toast({
        title: "Configuraciones guardadas",
        description: "Las configuraciones premium han sido actualizadas exitosamente"
      });
    } catch (error: any) {
      console.error("Error saving premium settings:", error);
      toast({
        title: "Error",
        description: `No se pudieron guardar las configuraciones: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getDisplayName = (key: string): string => {
    const setting = defaultSettings.find(s => s.setting_key === key);
    return setting ? setting.display_name : key;
  };

  const getDescription = (key: string): string => {
    const setting = defaultSettings.find(s => s.setting_key === key);
    return setting ? setting.description : "";
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
          <CardTitle>Configuración de Cuenta Premium</CardTitle>
          <CardDescription>
            Configure los datos para mostrar en la página de suscripción premium
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting, index) => (
            <div key={setting.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b pb-4 last:border-0">
              <div className="space-y-1">
                <Label htmlFor={`setting-${setting.id}`}>
                  {getDisplayName(setting.setting_key)}
                </Label>
                <p className="text-xs text-muted-foreground">{getDescription(setting.setting_key) || setting.description}</p>
              </div>
              <div className="md:col-span-2 space-y-2">
                {setting.setting_key.includes("instrucciones") ? (
                  <Textarea
                    id={`setting-${setting.id}`}
                    value={setting.setting_value}
                    onChange={(e) => handleUpdateSetting(index, e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                ) : (
                  <Input
                    id={`setting-${setting.id}`}
                    value={setting.setting_value}
                    onChange={(e) => handleUpdateSetting(index, e.target.value)}
                    className="w-full"
                  />
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`active-${setting.id}`}
                    checked={setting.is_active}
                    onCheckedChange={() => handleToggleSetting(index)}
                  />
                  <Label htmlFor={`active-${setting.id}`} className="text-sm">
                    {setting.is_active ? "Mostrar en página premium" : "Oculto"}
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={saving} className="ml-auto">
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default PremiumSettings;
