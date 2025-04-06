
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const EditarCarga = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        toast({
          title: "Acceso restringido",
          description: "Debe iniciar sesión para editar cargas",
          variant: "destructive",
        });
        navigate("/auth", { state: { from: `/editar-carga/${id}` } });
        return;
      }
      checkCargaAccess();
    };

    checkAuth();
  }, [id, navigate, toast]);

  const checkCargaAccess = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from("cargas")
        .select("*")
        .eq("id", id)
        .eq("usuario_id", user.id)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Acceso denegado",
          description: "No tiene permisos para editar esta carga",
          variant: "destructive",
        });
        navigate("/mis-cargas");
        return;
      }
      
      if (data.estado === "cancelada" || data.estado === "completada") {
        toast({
          title: "Edición no permitida",
          description: `No se puede editar una carga ${data.estado}`,
          variant: "destructive",
        });
        navigate("/mis-cargas");
        return;
      }

      // Here you would normally set the form values with the data
      setLoading(false);
    } catch (error: any) {
      console.error("Error checking carga access:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la información de la carga",
        variant: "destructive",
      });
      navigate("/mis-cargas");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/mis-cargas")} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a mis cargas
        </Button>
        <h1 className="text-2xl font-bold">Editar Carga</h1>
      </div>

      {loading ? (
        <div className="py-12 text-center">Cargando información...</div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center py-12 text-muted-foreground">
              Esta funcionalidad de edición de cargas estará disponible próximamente.
              <br />
              Por ahora, puede cancelar la carga existente y crear una nueva.
            </p>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => navigate("/mis-cargas")}>
                Volver a mis cargas
              </Button>
              <Button onClick={() => navigate(`/ver-carga/${id}`)}>
                Ver detalles de la carga
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EditarCarga;
