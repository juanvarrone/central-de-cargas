
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Tag, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemVariable {
  id: string;
  category: string;
  name: string;
  value: string;
  description?: string;
  is_active: boolean;
}

const CATEGORIES = [
  "tipos_camion",
  "tipos_carga",
  "opciones_adicionales",
  "datos_premium",
  "documentacion"
];

const CATEGORY_LABELS: Record<string, string> = {
  "tipos_camion": "Tipos de Camión",
  "tipos_carga": "Tipos de Carga",
  "opciones_adicionales": "Opciones Adicionales",
  "datos_premium": "Datos Premium",
  "documentacion": "Documentación Requerida"
};

const SystemVariables = () => {
  const [variables, setVariables] = useState<SystemVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [newVariable, setNewVariable] = useState<Partial<SystemVariable>>({
    category: activeCategory,
    name: "",
    value: "",
    description: "",
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVariables();
  }, []);

  useEffect(() => {
    setNewVariable(prev => ({ ...prev, category: activeCategory }));
  }, [activeCategory]);

  const fetchVariables = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("system_variables")
        .select("*")
        .order("category")
        .order("name");

      if (error) throw error;
      setVariables(data || []);
    } catch (error: any) {
      console.error("Error fetching system variables:", error);
      toast({
        title: "Error",
        description: `No se pudieron cargar las variables: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setNewVariable({ ...newVariable, [field]: value });
  };

  const handleSaveVariable = async () => {
    if (!newVariable.name || !newVariable.value) {
      toast({
        title: "Campos requeridos",
        description: "El nombre y el valor son obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("system_variables")
        .insert({
          category: newVariable.category,
          name: newVariable.name,
          value: newVariable.value,
          description: newVariable.description,
          is_active: newVariable.is_active
        })
        .select();

      if (error) throw error;

      setVariables([...variables, data[0]]);
      setNewVariable({
        category: activeCategory,
        name: "",
        value: "",
        description: "",
        is_active: true
      });
      toast({
        title: "Variable guardada",
        description: `La variable ${newVariable.name} ha sido guardada exitosamente`
      });
    } catch (error: any) {
      console.error("Error saving system variable:", error);
      toast({
        title: "Error",
        description: `No se pudo guardar la variable: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("system_variables")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;

      setVariables(
        variables.map(v => (v.id === id ? { ...v, is_active: !isActive } : v))
      );
    } catch (error: any) {
      console.error("Error toggling variable status:", error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteVariable = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro que desea eliminar la variable "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("system_variables")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setVariables(variables.filter(variable => variable.id !== id));
      toast({
        title: "Variable eliminada",
        description: `La variable "${name}" ha sido eliminada`
      });
    } catch (error: any) {
      console.error("Error deleting system variable:", error);
      toast({
        title: "Error",
        description: `No se pudo eliminar la variable: ${error.message}`,
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

  const filteredVariables = variables.filter(v => v.category === activeCategory);

  return (
    <div className="space-y-6">
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          {CATEGORIES.map(category => (
            <TabsTrigger key={category} value={category} className="text-xs md:text-sm">
              {CATEGORY_LABELS[category]}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(category => (
          <TabsContent key={category} value={category} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar nuevo valor para {CATEGORY_LABELS[category]}</CardTitle>
                <CardDescription>
                  Configure los valores disponibles para selección en los formularios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Semi con baranda"
                      value={newVariable.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Valor</Label>
                    <Input
                      id="value"
                      placeholder="Ej: semi_baranda"
                      value={newVariable.value}
                      onChange={(e) => handleInputChange("value", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Descripción adicional"
                      value={newVariable.description || ""}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={newVariable.is_active || false}
                      onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                    />
                    <Label htmlFor="is_active">Activo</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveVariable} 
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
              <h3 className="text-lg font-medium">Valores configurados</h3>
              {filteredVariables.length === 0 ? (
                <p className="text-muted-foreground">No hay valores configurados para {CATEGORY_LABELS[category]} todavía.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVariables.map((variable) => (
                    <Card key={variable.id} className={!variable.is_active ? "opacity-60" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{variable.name}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => handleDeleteVariable(variable.id, variable.name)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <code className="text-sm bg-muted p-1 rounded">
                            {variable.value}
                          </code>
                        </div>
                        {variable.description && (
                          <p className="text-sm text-muted-foreground">
                            {variable.description}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex items-center space-x-2 ml-auto">
                          <Switch
                            id={`toggle-${variable.id}`}
                            checked={variable.is_active}
                            onCheckedChange={() => handleToggleActive(variable.id, variable.is_active)}
                          />
                          <Label htmlFor={`toggle-${variable.id}`} className="text-sm">
                            {variable.is_active ? "Activo" : "Inactivo"}
                          </Label>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SystemVariables;
