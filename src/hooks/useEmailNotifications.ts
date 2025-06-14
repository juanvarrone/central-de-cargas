
import { supabase } from "@/integrations/supabase/client";

interface EmailNotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export const useEmailNotifications = () => {
  const sendEmailNotification = async (data: EmailNotificationData) => {
    try {
      console.log('Sending email notification:', data);
      
      const { error } = await supabase.functions.invoke('send-notification-email', {
        body: data
      });

      if (error) {
        console.error('Error sending email notification:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in sendEmailNotification:', error);
      return { success: false, error: error.message };
    }
  };

  const updateEmailPreferences = async (userId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications: enabled } as any)
        .eq('id', userId);

      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating email preferences:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    sendEmailNotification,
    updateEmailPreferences
  };
};
