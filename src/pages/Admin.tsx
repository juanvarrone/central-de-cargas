
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

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, isLoading } = useAuth();

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

        console.log("User found, checking admin status:", user.id, "isAdmin:", isAdmin);
        
        if (!isAdmin) {
          toast({
            title: "Acceso denegado",
            description: "No tienes permisos de administrador",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error("Admin access check error:", error);
        toast({
          title: "Error",
          description: error.message || "Error al verificar permisos de administrador",
          variant: "destructive",
        });
        navigate("/");
      }
    };
    
    checkAdminAccess();
  }, [navigate, toast, user, isAdmin, isLoading]);

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

  // Extra safety check - shouldn't render anything if not admin or not logged in
  if (!isAdmin || !user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-lg text-red-500">No tienes permisos para acceder a esta página</div>
      </div>
    );
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
