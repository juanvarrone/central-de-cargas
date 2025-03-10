
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  is_blocked: boolean | null;
  avatar_url: string | null;
}

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useUserProfile = (): UseUserProfileResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!userData.user) {
          setProfile(null);
          return;
        }
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        setProfile(profileData as UserProfile);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Error al cargar el perfil");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!profile) {
        throw new Error("No hay perfil de usuario para actualizar");
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', profile.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Refresh profile data
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      setProfile(updatedProfile as UserProfile);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Error al actualizar el perfil");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { profile, isLoading, error, updateProfile };
};
