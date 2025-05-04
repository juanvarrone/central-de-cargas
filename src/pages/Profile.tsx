import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, User } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(2, "Nombre muy corto").optional(),
  phone_number: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isLoading, error, updateProfile, uploadProfileImage } = useUserProfile();
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone_number: profile?.phone_number || "",
    },
  });

  // Update form when profile is loaded
  if (profile && !form.getValues("full_name") && profile.full_name) {
    form.setValue("full_name", profile.full_name);
  }
  if (profile && !form.getValues("phone_number") && profile.phone_number) {
    form.setValue("phone_number", profile.phone_number);
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        full_name: data.full_name,
        phone_number: data.phone_number,
      });
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido actualizados correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el perfil",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "La imagen es demasiado grande. Máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadProfileImage(file);
      
      if (imageUrl) {
        toast({
          title: "Imagen subida",
          description: "Tu foto de perfil ha sido actualizada",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al inicio
          </Button>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Cargando perfil...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al inicio
          </Button>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error al cargar el perfil</CardTitle>
            <CardDescription>
              {error || "No se pudo cargar la información de tu perfil. Por favor, inicia sesión nuevamente."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")}>
              Iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/")} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al inicio
        </Button>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Gestiona tu información personal y configuración de cuenta
              </CardDescription>
            </div>
            {profile.subscription_tier === "premium" ? (
              <Badge className="bg-yellow-500 hover:bg-yellow-600">Premium</Badge>
            ) : (
              <Badge variant="outline">Base</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || "Usuario"} />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                <label 
                  htmlFor="avatar-upload" 
                  className="cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-white" />
                  <input 
                    id="avatar-upload" 
                    type="file"
                    accept="image/*"
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-medium">{profile.full_name || "Usuario"}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="mt-1">
                <Badge variant="outline" className="mr-2">
                  Perfil {profile.user_type === 'dador' ? 'Dador de Cargas' : 'Camionero'}
                </Badge>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="(123) 456-7890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {profile.user_type === 'dador' && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Sube la imagen de tu negocio</h3>
                  <div className="border-dashed border-2 border-gray-300 rounded-md p-6 text-center">
                    <input
                      type="file"
                      id="business-image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <label 
                      htmlFor="business-image" 
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {uploading ? "Subiendo..." : "Haz clic para subir la imagen de tu empresa"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG o GIF (máx. 5MB)
                      </p>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </Form>
          
          {profile.subscription_tier === "base" && (
            <div className="mt-6 bg-muted/50 p-4 rounded-md">
              <h3 className="font-medium mb-2">¡Mejora a Premium!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Desbloquea funciones avanzadas y aumenta tus límites de publicación.
              </p>
              <Button 
                onClick={() => navigate("/premium")} 
                variant="outline"
                className="w-full"
              >
                Ver beneficios Premium
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
