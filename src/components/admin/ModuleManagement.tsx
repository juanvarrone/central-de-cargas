
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

type Module = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

const ModuleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newModule, setNewModule] = useState({ name: "", description: "" });

  const { data: modules, isLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_modules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Module[];
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: { name: string; description: string }) => {
      const { error } = await supabase
        .from("app_modules")
        .insert([moduleData]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      setNewModule({ name: "", description: "" });
      toast({
        title: "Módulo creado",
        description: "El módulo ha sido creado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleModuleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("app_modules")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast({
        title: "Módulo actualizado",
        description: "El estado del módulo ha sido actualizado",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModule.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del módulo es requerido",
        variant: "destructive",
      });
      return;
    }
    createModuleMutation.mutate(newModule);
  };

  if (isLoading) {
    return <div>Cargando módulos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Crear Nuevo Módulo</h2>
        <form onSubmit={handleCreateModule} className="space-y-4">
          <div>
            <Input
              placeholder="Nombre del módulo"
              value={newModule.name}
              onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
            />
          </div>
          <div>
            <Textarea
              placeholder="Descripción del módulo"
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={createModuleMutation.isPending}>
            <PlusCircle className="mr-2" />
            {createModuleMutation.isPending ? "Creando..." : "Crear Módulo"}
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Módulos Existentes</h2>
        <div className="space-y-4">
          {modules?.map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <h3 className="font-medium">{module.name}</h3>
                {module.description && (
                  <p className="text-sm text-gray-600">{module.description}</p>
                )}
              </div>
              <Switch
                checked={module.is_active}
                onCheckedChange={(checked) =>
                  toggleModuleMutation.mutate({ id: module.id, is_active: checked })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleManagement;
