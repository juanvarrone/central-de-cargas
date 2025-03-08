
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  is_blocked: boolean;
  blocked_reason: string | null;
  role?: "admin" | "user";
};

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [blockReasons, setBlockReasons] = useState<Record<string, string>>({});

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching user profiles...");
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Profiles fetched:", profiles);

      try {
        const rolesPromises = profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .single();

          return {
            ...profile,
            role: roleData?.role || "user",
          };
        });

        const usersWithRoles = await Promise.all(rolesPromises);
        console.log("Users with roles:", usersWithRoles);
        return usersWithRoles;
      } catch (error) {
        console.error("Error fetching roles:", error);
        return profiles.map(profile => ({
          ...profile,
          role: "user"
        }));
      }
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({
      userId,
      isBlocked,
      reason,
    }: {
      userId: string;
      isBlocked: boolean;
      reason?: string;
    }) => {
      console.log("Toggling user block status:", { userId, isBlocked, reason });
      const { data, error } = await supabase
        .from("profiles")
        .update({
          is_blocked: isBlocked,
          blocked_reason: isBlocked ? reason : null,
        })
        .eq("id", userId)
        .select();

      if (error) {
        console.error("Error toggling user block status:", error);
        throw error;
      }
      
      console.log("User block status updated:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setBlockReasons({});
      toast({
        title: "Usuario actualizado",
        description: "El estado del usuario ha sido actualizado",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "user";
    }) => {
      console.log("Updating user role:", { userId, role });
      if (role === "admin") {
        // Check if role entry exists already
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", userId)
          .single();
          
        if (existingRole) {
          // Update existing role
          const { data, error } = await supabase
            .from("user_roles")
            .update({ role })
            .eq("user_id", userId)
            .select();
            
          if (error) throw error;
          return data;
        } else {
          // Insert new role
          const { data, error } = await supabase
            .from("user_roles")
            .insert([{ user_id: userId, role }])
            .select();
            
          if (error) throw error;
          return data;
        }
      } else {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);
          
        if (error) throw error;
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBlockReasonChange = (userId: string, reason: string) => {
    setBlockReasons(prev => ({
      ...prev,
      [userId]: reason
    }));
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-lg font-medium text-red-800">Error al cargar los usuarios</h3>
        <p className="text-red-600 mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users && users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">
                    {user.full_name || "Sin nombre"}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.is_blocked && (
                    <p className="text-sm text-red-600">
                      Razón del bloqueo: {user.blocked_reason}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select
                    value={user.role}
                    onValueChange={(value: "admin" | "user") =>
                      updateRoleMutation.mutate({ userId: user.id, role: value })
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={user.is_blocked}
                      onCheckedChange={(checked) => {
                        if (checked && !blockReasons[user.id]) {
                          toast({
                            title: "Error",
                            description: "Debe proporcionar una razón para bloquear al usuario",
                            variant: "destructive",
                          });
                          return;
                        }
                        toggleBlockMutation.mutate({
                          userId: user.id,
                          isBlocked: checked,
                          reason: blockReasons[user.id],
                        });
                      }}
                    />
                    <span className="text-sm">
                      {user.is_blocked ? "Bloqueado" : "Activo"}
                    </span>
                  </div>

                  {!user.is_blocked && (
                    <Input
                      placeholder="Razón del bloqueo"
                      value={blockReasons[user.id] || ""}
                      onChange={(e) => handleBlockReasonChange(user.id, e.target.value)}
                      className="w-full sm:w-auto"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay usuarios disponibles en el sistema.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
