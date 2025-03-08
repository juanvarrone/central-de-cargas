
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";

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

  const { data: modules, isLoading, error } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      console.log("Fetching modules...");
      const { data, error } = await supabase
        .from("app_modules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching modules:", error);
        throw error;
      }
      
      console.log("Modules fetched:", data);
      return data as Module[];
    },
  });

  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: { name: string; description: string }) => {
      console.log("Creating module:", moduleData);
      const { data, error } = await supabase
        .from("app_modules")
        .insert([moduleData])
        .select();

      if (error) {
        console.error("Error creating module:", error);
        throw error;
      }
      
      console.log("Module created:", data);
      return data;
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
      console.log("Toggling module status:", { id, is_active });
      const { data, error } = await supabase
        .from("app_modules")
        .update({ is_active })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error toggling module status:", error);
        throw error;
      }
      
      console.log("Module status updated:", data);
      return data;
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

  if (error) {
    console.error("Error in ModuleManagement:", error);
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800">Error al cargar los módulos</h3>
        <p className="text-red-600 mt-2">{(error as Error).message}</p>
      </div>
    );
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
            {createModuleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2" />
                Crear Módulo
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Módulos Existentes</h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : modules && modules.length > 0 ? (
          <div className="space-y-4">
            {modules.map((module) => (
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
                <div className="flex items-center gap-2">
                  <span className="text-sm mr-2">
                    {module.is_active ? "Activo" : "Inactivo"}
                  </span>
                  <Switch
                    checked={module.is_active}
                    onCheckedChange={(checked) =>
                      toggleModuleMutation.mutate({ id: module.id, is_active: checked })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay módulos disponibles. Crea uno nuevo para comenzar.
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleManagement;
