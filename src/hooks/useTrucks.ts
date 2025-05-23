
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Truck {
  id: string;
  tipo_camion: string;
  capacidad: string;
  refrigerado: boolean;
  patente_chasis: string;
  patente_acoplado: string | null;
  foto_chasis: string | null;
  foto_acoplado: string | null;
  foto_chasis_thumbnail: string | null;
  created_at: string;
  user_id: string;
}

export const useTrucks = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUserAndFetchTrucks = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!userData.user) {
          // No user logged in
          setTrucks([]);
          return;
        }
        
        setUser(userData.user);
        
        console.log("Fetching trucks for user:", userData.user.id);
        
        // Fetch trucks for this user
        const { data, error: trucksError } = await supabase
          .from('trucks')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });
        
        if (trucksError) {
          throw trucksError;
        }
        
        console.log("Trucks data:", data);
        
        // Transform data to ensure it includes foto_chasis_thumbnail (which might be null)
        const truckData: Truck[] = data?.map((truck: any) => ({
          ...truck,
          foto_chasis_thumbnail: truck.foto_chasis_thumbnail || null
        })) || [];
        
        setTrucks(truckData);
      } catch (err: any) {
        console.error('Error fetching trucks:', err);
        setError(err.message || 'Error al cargar los camiones');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserAndFetchTrucks();
    
    // Setup auth listener to refresh trucks when auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkUserAndFetchTrucks();
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { trucks, isLoading, error, user };
};
