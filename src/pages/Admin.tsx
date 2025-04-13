
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ModuleManagement from "@/components/admin/ModuleManagement";
import UserManagement from "@/components/admin/UserManagement";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, session, isLoading } = useAuth();

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

        // Direct check for admin status via database query
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (roleError) {
          console.error("Error checking user roles:", roleError);
        }
        
        if (roleData && roleData.role === 'admin') {
          console.log("Admin role confirmed from user_roles table");
          setIsAdmin(true);
          setLoading(false);
          return;
        }
        
        // Fallback to profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();
        
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

  // Show loading state while checking session and admin status
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-lg">Cargando panel de administración...</div>
        </div>
      </div>
    );
  }

  // Extra safety check - shouldn't render anything if not admin
  if (!isAdmin || !user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="modules">Gestión de Módulos</TabsTrigger>
          <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="modules" className="w-full">
          <ModuleManagement />
        </TabsContent>
        
        <TabsContent value="users" className="w-full">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
