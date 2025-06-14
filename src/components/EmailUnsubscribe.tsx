
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, CheckCircle } from "lucide-react";

const EmailUnsubscribe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleUnsubscribe(token);
    } else {
      setError('Token de baja inválido');
      setLoading(false);
    }
  }, [searchParams]);

  const handleUnsubscribe = async (token: string) => {
    try {
      // Decodificar el token (que contiene el user_id)
      const userId = atob(token);
      
      // Actualizar las preferencias del usuario
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications: false })
        .eq('id', userId);

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Baja exitosa",
        description: "Te has dado de baja de las notificaciones por email",
      });
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      setError('Error al procesar la baja. Intenta nuevamente.');
      toast({
        title: "Error",
        description: "No se pudo procesar la baja",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Procesando tu solicitud...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>¡Baja exitosa!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Te has dado de baja exitosamente de las notificaciones por email.
            </p>
            <p className="text-sm text-muted-foreground">
              Aún recibirás notificaciones dentro de la aplicación. 
              Puedes reactivar las notificaciones por email desde tu perfil.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <Mail className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default EmailUnsubscribe;
