
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

  const handleSubmit = async (data: any) => {
    try {
      if (currentAlert?.id) {
        // Convert date objects to ISO strings if they exist
        const updatedAlert = {
          ...currentAlert,
          ...data,
          date_from: data.date_from ? data.date_from.toISOString() : null,
          date_to: data.date_to ? data.date_to.toISOString() : null,
        };
        
        await updateAlert.mutateAsync(updatedAlert);
      } else {
        // Convert locations from comma-separated string to array and date objects to strings
        const newAlert = {
          name: data.name,
          radius_km: data.radius_km,
          locations: data.selectedLocations ? data.selectedLocations.split(',').map((s: string) => s.trim()) : [],
          date_from: data.date_from ? data.date_from.toISOString() : null,
          date_to: data.date_to ? data.date_to.toISOString() : null,
          notify_new_loads: data.notify_new_loads,
          notify_available_trucks: data.notify_available_trucks,
        };
        
        await createAlert.mutateAsync(newAlert);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving alert:", error);
    }
  };

  const handleEdit = (alert: UserAlert) => {
    // Convert date strings to Date objects for the form
    const formattedAlert = {
      ...alert,
      date_from: alert.date_from ? new Date(alert.date_from) : undefined,
      date_to: alert.date_to ? new Date(alert.date_to) : undefined,
      selectedLocations: alert.locations ? alert.locations.join(', ') : ''
    };
    
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
                defaultValues={currentAlert ? {
                  name: currentAlert.name,
                  radius_km: currentAlert.radius_km,
                  selectedLocations: currentAlert.locations?.join(', '),
                  date_from: currentAlert.date_from ? new Date(currentAlert.date_from) : undefined,
                  date_to: currentAlert.date_to ? new Date(currentAlert.date_to) : undefined,
                  notify_new_loads: currentAlert.notify_new_loads,
                  notify_available_trucks: currentAlert.notify_available_trucks,
                } : undefined}
                onSubmit={handleSubmit}
                loading={isCreating || isEditing}
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
