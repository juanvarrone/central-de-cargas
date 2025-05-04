
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import TruckCard from "@/components/truck/TruckCard";
import { useTrucks, Truck } from "@/hooks/useTrucks";

const MisCamiones = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trucks, isLoading, error } = useTrucks();
  const [truckToDelete, setTruckToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        toast({
          title: "Acceso restringido",
          description: "Debe iniciar sesión para ver sus camiones",
          variant: "destructive",
        });
        navigate("/auth", { state: { from: "/mis-camiones" } });
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleDelete = async (truckId: string) => {
    try {
      setDeleteLoading(true);
      
      const { error } = await supabase
        .from("trucks")
        .delete()
        .eq("id", truckId);
      
      if (error) throw error;
      
      toast({
        title: "Camión eliminado",
        description: "El camión ha sido eliminado exitosamente",
      });
      
      // Refresh the trucks list
      window.location.reload();
      
    } catch (error: any) {
      console.error("Error deleting truck:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el camión",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setTruckToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando camiones...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Mis Camiones</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          {trucks.length === 0
            ? "No tienes camiones registrados"
            : `${trucks.length} camiones registrados`}
        </p>
        <Button onClick={() => navigate("/agregar-camion")}>
          <Plus size={16} className="mr-2" />
          Agregar Camión
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4 text-red-800">
          {error}
        </div>
      )}

      {trucks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4">No has registrado ningún camión todavía.</p>
            <Button onClick={() => navigate("/agregar-camion")}>
              <Plus size={16} className="mr-2" />
              Registrar mi primer camión
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {trucks.map((truck: Truck) => (
            <div key={truck.id} className="relative">
              <TruckCard truck={truck} />
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/editar-camion/${truck.id}`)}
                  className="bg-white"
                >
                  <Edit size={16} />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Eliminar este camión lo quitará permanentemente de su cuenta.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(truck.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? "Eliminando..." : "Sí, eliminar camión"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCamiones;
