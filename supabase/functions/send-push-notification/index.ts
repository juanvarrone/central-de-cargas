
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  user_id: string;
  title: string;
  body: string;
  link?: string;
  data?: Record<string, any>;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const sendPushNotification = async (token: string, platform: string, notification: any) => {
  const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
  
  if (!fcmServerKey) {
    throw new Error('FCM_SERVER_KEY not configured');
  }

  const payload = {
    to: token,
    notification: {
      title: notification.title,
      body: notification.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    },
    data: {
      link: notification.link || '/',
      ...notification.data
    },
    android: {
      notification: {
        icon: 'ic_stat_icon_config_sample',
        color: '#488AFF',
        sound: 'default',
        click_action: 'FCM_PLUGIN_ACTIVITY',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${fcmServerKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FCM Error: ${error}`);
  }

  return await response.json();
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, body, link, data }: PushNotificationRequest = await req.json();

    console.log(`Sending push notification to user: ${user_id}`);

    // Obtener tokens de push del usuario
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', user_id);

    if (tokensError) {
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log(`No push tokens found for user: ${user_id}`);
      return new Response(
        JSON.stringify({ message: 'No push tokens found for user' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const results = [];

    // Enviar notificación a todos los tokens del usuario
    for (const tokenRecord of tokens) {
      try {
        const result = await sendPushNotification(
          tokenRecord.token,
          tokenRecord.platform,
          { title, body, link, data }
        );
        
        results.push({
          token: tokenRecord.token,
          platform: tokenRecord.platform,
          success: true,
          result
        });

        console.log(`Push notification sent successfully to ${tokenRecord.platform} device`);
      } catch (error) {
        console.error(`Error sending to token ${tokenRecord.token}:`, error);
        
        results.push({
          token: tokenRecord.token,
          platform: tokenRecord.platform,
          success: false,
          error: error.message
        });

        // Si el token es inválido, eliminarlo de la base de datos
        if (error.message.includes('invalid') || error.message.includes('not registered')) {
          await supabase
            .from('push_tokens')
            .delete()
            .eq('id', tokenRecord.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Push notifications processed',
        results 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);
