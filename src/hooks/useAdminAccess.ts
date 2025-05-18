
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        console.log("Checking admin access...");
        
        // Wait for auth context to load
        if (isLoading) {
          console.log("Auth context is still loading");
          return;
        }
        
        if (!user) {
          console.log("No user found, redirecting to auth");
          toast({
            title: "Acceso denegado",
            description: "Debe iniciar sesión para acceder al panel de administración",
            variant: "destructive",
          });
          navigate("/auth", { state: { from: "/admin" } });
          return;
        }

        console.log("Checking admin status for user:", user.email);
        
        // Collect debug information
        const debugData: any = {
          userId: user.id,
          userEmail: user.email,
          queries: []
        };

        // Direct check for admin status via database query
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);
        
        debugData.queries.push({ 
          table: 'user_roles', 
          result: roleData,
          error: roleError 
        });
        
        if (roleError) {
          console.error("Error checking user roles:", roleError);
        }
        
        if (roleData && roleData.length > 0) {
          const adminRole = roleData.find(r => r.role === 'admin');
          if (adminRole) {
            console.log("Admin role confirmed from user_roles table");
            setIsAdmin(true);
            setDebugInfo(debugData);
            setLoading(false);
            return;
          }
        }
        
        // Fallback to profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        debugData.queries.push({ 
          table: 'profiles', 
          result: profileData,
          error: profileError 
        });
        
        if (profileError) {
          console.error("Error checking profiles:", profileError);
          toast({
            title: "Error",
            description: "Error al verificar permisos de administrador",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        setDebugInfo(debugData);
        
        if (profileData?.is_admin) {
          console.log("Admin status confirmed from profiles table");
          setIsAdmin(true);
          setLoading(false);
          return;
        }
        
        // Not an admin
        console.log("User is not an admin, redirecting");
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de administrador",
          variant: "destructive",
        });
        navigate("/");
        
      } catch (error: any) {
        console.error("Admin access check error:", error);
        toast({
          title: "Error",
          description: error.message || "Error al verificar permisos de administrador",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [navigate, toast, user, isLoading]);

  return { loading, isAdmin, debugInfo };
};
