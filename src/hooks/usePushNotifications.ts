
import { useState, useEffect } from 'react';
import { 
  PushNotifications, 
  PushNotificationSchema, 
  ActionPerformed,
  Token 
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si estamos en una plataforma móvil nativa
    const checkSupport = () => {
      const supported = Capacitor.isNativePlatform();
      setIsSupported(supported);
      
      if (supported) {
        initializePushNotifications();
      }
    };

    checkSupport();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Solicitar permisos
      const permissionResult = await PushNotifications.requestPermissions();
      
      if (permissionResult.receive === 'granted') {
        // Registrar con APNs / FCM
        await PushNotifications.register();
        
        // Listener para cuando se recibe el token
        PushNotifications.addListener('registration', async (token: Token) => {
          console.log('Push registration success, token: ' + token.value);
          setToken(token.value);
          await saveTokenToDatabase(token.value);
          setIsRegistered(true);
        });

        // Listener para errores de registro
        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration: ' + JSON.stringify(error));
          toast({
            title: "Error en notificaciones",
            description: "No se pudieron configurar las notificaciones push",
            variant: "destructive",
          });
        });

        // Listener para notificaciones recibidas
        PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received: ', notification);
            
            // Mostrar notificación local si la app está en foreground
            toast({
              title: notification.title || "Nueva notificación",
              description: notification.body || "",
            });
          },
        );

        // Listener para cuando se toca una notificación
        PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification: ActionPerformed) => {
            console.log('Push notification action performed', notification);
            
            // Manejar navegación basada en el link de la notificación
            if (notification.notification.data?.link) {
              window.location.href = notification.notification.data.link;
            }
          },
        );
      } else {
        console.log('Push notification permission denied');
        toast({
          title: "Permisos denegados",
          description: "Las notificaciones push han sido deshabilitadas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const saveTokenToDatabase = async (pushToken: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Usar una consulta SQL raw para insertar/actualizar
      const { error } = await supabase.rpc('handle_push_token_upsert', {
        p_user_id: user.id,
        p_token: pushToken,
        p_platform: Capacitor.getPlatform()
      });

      if (error) {
        // Si la función no existe, usar el método directo
        const { error: insertError } = await supabase
          .from('push_tokens')
          .upsert({
            user_id: user.id,
            token: pushToken,
            platform: Capacitor.getPlatform(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,platform'
          });

        if (insertError) throw insertError;
      }

      console.log('Push token saved successfully');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  const unregister = async () => {
    try {
      await PushNotifications.removeAllListeners();
      
      // Eliminar token de la base de datos
      const { data: { user } } = await supabase.auth.getUser();
      if (user && token) {
        const { error } = await supabase
          .from('push_tokens')
          .delete()
          .eq('user_id', user.id)
          .eq('token', token);

        if (error) {
          console.error('Error deleting push token:', error);
        }
      }
      
      setIsRegistered(false);
      setToken(null);
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
    }
  };

  return {
    isSupported,
    isRegistered,
    token,
    unregister
  };
};
