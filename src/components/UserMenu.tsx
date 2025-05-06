
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  LogOut,
  User as UserIcon,
  Truck,
  Bell,
  FileText,
  ClipboardList,
  Crown,
  Shield
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// This will help prevent duplicate instances
let userMenuInstanceCount = 0;

const UserMenu = () => {
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const [open, setOpen] = useState(false);
  const { user, isAdmin, userType, canPublishCamion, canPostulateToCarga } = useAuth();
  const [instanceId] = useState(() => userMenuInstanceCount++);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      userMenuInstanceCount--;
    };
  }, []);

  useEffect(() => {
    // Close dropdown when navigating
    const handleRouteChange = () => {
      setOpen(false);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  // If this is a duplicate instance, don't render again
  if (instanceId > 0) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user || profileLoading) {
    return (
      <Button variant="outline" size="sm" className="h-9 px-2">
        <UserIcon size={18} />
      </Button>
    );
  }

  const isCamionero = userType === "camionero";
  const isDador = userType === "dador";
  const isPremium = profile?.subscription_tier === "premium";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-2 md:px-4">
          <UserIcon size={18} className="mr-0 md:mr-2" />
          <span className="hidden md:block">
            {profile?.full_name || user.email?.split("@")[0]}
          </span>
          <Menu size={16} className="ml-0 md:ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <Link to="/perfil">
          <DropdownMenuItem className="cursor-pointer">
            <UserIcon size={16} className="mr-2" />
            Mi Perfil
          </DropdownMenuItem>
        </Link>

        {/* Show this item for both admin and transportista/camionero */}
        {(isAdmin || canPublishCamion) && (
          <>
            <Link to="/mis-postulaciones">
              <DropdownMenuItem className="cursor-pointer">
                <ClipboardList size={16} className="mr-2" />
                Mis Postulaciones
              </DropdownMenuItem>
            </Link>
            <Link to="/mis-camiones">
              <DropdownMenuItem className="cursor-pointer">
                <Truck size={16} className="mr-2" />
                Mis Camiones
              </DropdownMenuItem>
            </Link>
          </>
        )}

        {/* Show these items for both admin and dador */}
        {(isAdmin || isDador) && (
          <Link to="/mis-cargas">
            <DropdownMenuItem className="cursor-pointer">
              <FileText size={16} className="mr-2" />
              Mis Cargas
            </DropdownMenuItem>
          </Link>
        )}

        <Link to="/mis-alertas">
          <DropdownMenuItem className="cursor-pointer">
            <Bell size={16} className="mr-2" />
            Mis Alertas
          </DropdownMenuItem>
        </Link>
        
        <Link to="/premium">
          <DropdownMenuItem className="cursor-pointer">
            <Crown size={16} className="mr-2" />
            {isPremium ? "Premium Activo" : "Obtener Premium"}
          </DropdownMenuItem>
        </Link>

        {isAdmin && (
          <Link to="/admin">
            <DropdownMenuItem className="cursor-pointer">
              <Shield size={16} className="mr-2" />
              Admin Panel
            </DropdownMenuItem>
          </Link>
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
          <LogOut size={16} className="mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
