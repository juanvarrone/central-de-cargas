
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailNotificationRequest {
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const getEmailTemplate = (type: string, title: string, message: string, userName: string, link?: string, unsubscribeLink?: string) => {
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/supabase', '') || 'https://tu-app.com';
  const fullLink = link ? `${baseUrl}${link}` : baseUrl;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
      <table style="width: 100%; background-color: #f4f4f4; padding: 20px 0;">
        <tr>
          <td align="center">
            <table style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #2563eb; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                    TransportApp
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">
                    Hola ${userName},
                  </h2>
                  
                  <h3 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">
                    ${title}
                  </h3>
                  
                  <p style="color: #4b5563; margin: 0 0 25px 0; font-size: 16px; line-height: 1.5;">
                    ${message}
                  </p>
                  
                  ${link ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${fullLink}" 
                       style="background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      Ver detalles
                    </a>
                  </div>
                  ` : ''}
                  
                  <p style="color: #6b7280; margin: 25px 0 0 0; font-size: 14px; line-height: 1.4;">
                    Saludos cordiales,<br>
                    <strong>El equipo de TransportApp</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 12px; text-align: center;">
                    © 2024 TransportApp. Todos los derechos reservados.
                  </p>
                  
                  ${unsubscribeLink ? `
                  <p style="color: #9ca3af; margin: 0; font-size: 11px; text-align: center;">
                    Si no deseas recibir más emails de notificaciones, puedes 
                    <a href="${unsubscribeLink}" style="color: #6b7280; text-decoration: underline;">
                      darte de baja aquí
                    </a>
                  </p>
                  ` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, type, title, message, link }: EmailNotificationRequest = await req.json();

    console.log(`Processing email notification for user: ${user_id}, type: ${type}`);

    // Verificar si RESEND_API_KEY está configurada
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured, skipping email send');
      return new Response(
        JSON.stringify({ message: 'Email service not configured yet' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Obtener información del usuario
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email, full_name, email_notifications')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verificar si el usuario tiene habilitadas las notificaciones por email
    if (!userData.email_notifications) {
      console.log(`User ${user_id} has email notifications disabled`);
      return new Response(
        JSON.stringify({ message: 'User has email notifications disabled' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);
    
    // Generar link de baja personalizado
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/supabase', '') || 'https://tu-app.com';
    const unsubscribeLink = `${baseUrl}/unsubscribe?token=${btoa(user_id)}`;

    // Generar el HTML del email
    const emailHtml = getEmailTemplate(
      type,
      title,
      message,
      userData.full_name || 'Usuario',
      link,
      unsubscribeLink
    );

    // Enviar el email
    const emailResponse = await resend.emails.send({
      from: 'TransportApp <noreply@tu-dominio.com>',
      to: [userData.email],
      subject: title,
      html: emailHtml,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({ 
        message: 'Email sent successfully',
        emailId: emailResponse.data?.id 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in send-notification-email function:', error);
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
