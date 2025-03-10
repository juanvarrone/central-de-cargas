
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface PhoneValidationResult {
  hasValidPhone: boolean;
  phoneNumber: string | null;
  isLoading: boolean;
  error: string | null;
  updatePhoneNumber: (phoneNumber: string) => Promise<void>;
}

export const usePhoneValidation = (): PhoneValidationResult => {
  const [hasValidPhone, setHasValidPhone] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPhone = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          setError("No hay usuario autenticado");
          setHasValidPhone(false);
          return;
        }
        
        // Get profile data including phone_number
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', userData.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError("Error al verificar el teléfono");
          setHasValidPhone(false);
          return;
        }
        
        const hasPhone = profileData?.phone_number ? true : false;
        setPhoneNumber(profileData?.phone_number || null);
        setHasValidPhone(hasPhone);
      } catch (err: any) {
        console.error("Error checking phone:", err);
        setError(err.message || "Error al verificar el teléfono");
        setHasValidPhone(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkPhone();
    
    // Listen for auth state changes to recheck phone
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkPhone();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updatePhoneNumber = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error("No hay usuario autenticado");
      }
      
      // Update phone_number in profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone_number: phoneNumber })
        .eq('id', userData.user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      setPhoneNumber(phoneNumber);
      setHasValidPhone(true);
    } catch (err: any) {
      console.error("Error updating phone:", err);
      setError(err.message || "Error al actualizar el teléfono");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { hasValidPhone, phoneNumber, isLoading, error, updatePhoneNumber };
};
