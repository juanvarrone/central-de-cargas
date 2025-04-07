
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  is_blocked: boolean | null;
  avatar_url: string | null;
  user_type: 'dador' | 'camionero' | null;
  subscription_tier: 'base' | 'premium' | null;
  subscription_ends_at: string | null;
  avg_punctuality_rating?: number | null;
  avg_equipment_rating?: number | null;
  avg_respect_rating?: number | null;
  avg_overall_rating?: number | null;
  total_reviews?: number | null;
  blocked_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  is_admin?: boolean | null;
}

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string | null>;
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
        
        // Cast and set profile data with default values for required fields
        setProfile({
          ...(profileData as UserProfile),
          user_type: profileData.user_type || null,
          subscription_tier: profileData.subscription_tier || 'base',
          subscription_ends_at: profileData.subscription_ends_at || null
        });
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
      
      // Update profile state with the refreshed data
      setProfile({
        ...(updatedProfile as UserProfile),
        user_type: updatedProfile.user_type || profile.user_type,
        subscription_tier: updatedProfile.subscription_tier || profile.subscription_tier,
        subscription_ends_at: updatedProfile.subscription_ends_at || profile.subscription_ends_at
      });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Error al actualizar el perfil");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add function to upload profile image
  const uploadProfileImage = async (file: File): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!profile) {
        throw new Error("No hay perfil de usuario para actualizar");
      }
      
      const fileExt = file.name.split('.').pop();
      const filePath = `profile_images/${profile.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: publicURL } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (!publicURL) {
        throw new Error("No se pudo obtener la URL de la imagen");
      }
      
      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicURL.publicUrl });
      
      return publicURL.publicUrl;
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message || "Error al subir la imagen");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { profile, isLoading, error, updateProfile, uploadProfileImage };
};
