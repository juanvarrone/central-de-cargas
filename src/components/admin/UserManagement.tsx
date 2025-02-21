
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

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  is_blocked: boolean;
  blocked_reason: string | null;
};

type UserRole = {
  role: "admin" | "user";
};

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [blockReason, setBlockReason] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

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
      return usersWithRoles;
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
      const { error } = await supabase
        .from("profiles")
        .update({
          is_blocked: isBlocked,
          blocked_reason: isBlocked ? reason : null,
        })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setBlockReason("");
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
      if (role === "admin") {
        const { error } = await supabase
          .from("user_roles")
          .insert([{ user_id: userId, role }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId);
        if (error) throw error;
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

  if (isLoading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
        <div className="space-y-4">
          {users?.map((user) => (
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
                      if (checked && !blockReason) {
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
                        reason: blockReason,
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
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full sm:w-auto"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
