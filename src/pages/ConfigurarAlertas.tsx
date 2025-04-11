
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout";
import { useUserAlerts, UserAlert } from "@/hooks/useUserAlerts";
import AlertForm from "@/components/alerts/AlertForm";
import AlertsList from "@/components/alerts/AlertsList";

const ConfigurarAlertas = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<UserAlert | undefined>(undefined);
  
  const { 
    alerts, 
    isLoading, 
    createAlert, 
    updateAlert, 
    deleteAlert,
    isCreating,
    isEditing,
    isDeleting,
    isCamionero,
    isDador
  } = useUserAlerts();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        toast({
          title: "Acceso restringido",
          description: "Debes iniciar sesión para acceder a esta página",
          variant: "destructive",
        });
        navigate("/auth");
      } else {
        setUser(data.user);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async (data: Partial<UserAlert>) => {
    try {
      if (currentAlert?.id) {
        await updateAlert.mutateAsync({ ...data, id: currentAlert.id } as UserAlert);
      } else {
        await createAlert.mutateAsync(data as Omit<UserAlert, 'id' | 'user_id'>);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving alert:", error);
    }
  };

  const handleEdit = (alert: UserAlert) => {
    setCurrentAlert(alert);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlert.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  const resetForm = () => {
    setCurrentAlert(undefined);
    setShowForm(false);
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mis Alertas</h1>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="flex items-center"
            >
              <Plus className="mr-1 h-4 w-4" /> Nueva Alerta
            </Button>
          )}
        </div>

        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>{currentAlert ? 'Editar Alerta' : 'Nueva Alerta'}</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertForm
                defaultValues={currentAlert}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                isSubmitting={isCreating || isEditing}
                isCamionero={isCamionero}
                isDador={isDador}
              />
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <AlertsList
            alerts={alerts || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </Layout>
  );
};

export default ConfigurarAlertas;
