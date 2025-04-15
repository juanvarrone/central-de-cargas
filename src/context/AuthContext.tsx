
import { createContext, useState, useEffect, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserType = "dador" | "camionero" | null;

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  userType: UserType;
  canPublishCarga: boolean;
  canPublishCamion: boolean;
  canContactTransportistas: boolean;
  canPostulateToCarga: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
  userType: null,
  canPublishCarga: false,
  canPublishCamion: false,
  canContactTransportistas: false,
  canPostulateToCarga: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  
  // Derived permissions based on user role
  const canPublishCarga = isAdmin || userType === "dador";
  const canPublishCamion = isAdmin || userType === "camionero";
  const canContactTransportistas = isAdmin || userType === "dador";
  const canPostulateToCarga = isAdmin || userType === "camionero";

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase
          setTimeout(() => {
            checkUserStatus(currentSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setUserType(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got session:", currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        checkUserStatus(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserStatus = async (userId: string) => {
    try {
      console.log("Checking user status for user:", userId);
      
      // Get user profile with type information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, is_admin')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error checking profile:", profileError);
      }
      
      console.log("Profile data:", profileData);
      
      // First, check admin status
      let adminStatus = false;
      
      // Check user_roles table for admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      console.log("User roles check:", { roleData, roleError });
      
      if (!roleError && roleData && roleData.length > 0) {
        const isUserAdmin = roleData.some(record => record.role === 'admin');
        if (isUserAdmin) {
          console.log("Admin role found in user_roles table");
          adminStatus = true;
        }
      }
      
      // If not admin from roles, check profiles table as fallback
      if (!adminStatus && profileData?.is_admin) {
        console.log("Admin status found in profiles table");
        adminStatus = true;
      }
      
      // Set state values
      setIsAdmin(adminStatus);
      setUserType(profileData?.user_type || null);
      
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    user, 
    session, 
    isLoading, 
    isAdmin,
    userType,
    canPublishCarga,
    canPublishCamion,
    canContactTransportistas,
    canPostulateToCarga
  };

  console.log("AuthContext state:", contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
