
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCircle, Phone } from "lucide-react";

const phoneRegex = /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const profileSchema = z.object({
  phoneNumber: z.string()
    .refine(val => phoneRegex.test(val), {
      message: "Formato de teléfono inválido. Ej: (123) 456-7890"
    }),
  userType: z.enum(["dador", "camionero"], {
    required_error: "Debes seleccionar un tipo de usuario",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const CompleteProfile = () => {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phoneNumber: "",
      userType: undefined,
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }
        
        // Check if user has already completed their profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone_number, user_type")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.phone_number && profile?.user_type) {
          // Profile already complete, redirect to home
          console.log("Profile already complete, redirecting to home");
          navigate("/");
          return;
        }

        setUserName(session.user.user_metadata.full_name || session.user.user_metadata.name || null);
        setUserEmail(session.user.email);
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No hay sesión activa");
      }
      
      // Update user profile
      const { error } = await supabase
        .from("profiles")
        .update({
          phone_number: values.phoneNumber,
          user_type: values.userType,
        })
        .eq("id", session.user.id);
      
      if (error) throw error;
      
      toast({
        title: "Perfil completado",
        description: "¡Gracias por completar tu perfil!",
      });
      
      // Redirect to home page
      navigate("/");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Cargando...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Completa tu perfil</CardTitle>
          <CardDescription>
            Necesitamos un poco más de información para continuar
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {userName && (
            <div className="flex items-center gap-2 mb-6">
              <UserCircle className="h-6 w-6" />
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormItem>
                <FormLabel>Número de teléfono (WhatsApp)</FormLabel>
                <FormControl>
                  <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-background">
                    <Phone className="ml-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="(123) 456-7890" 
                      {...form.register("phoneNumber")}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
              
              <div className="space-y-2">
                <Label htmlFor="user-type">¿Qué tipo de usuario eres?</Label>
                <RadioGroup 
                  defaultValue={form.getValues("userType")}
                  onValueChange={(value) => form.setValue("userType", value as "dador" | "camionero")}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  <div>
                    <RadioGroupItem
                      value="dador"
                      id="dador"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="dador"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="font-semibold">Dador de carga</span>
                      <span className="text-sm text-center text-muted-foreground">
                        Tengo carga para transportar
                      </span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem
                      value="camionero"
                      id="camionero"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="camionero"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="font-semibold">Camionero</span>
                      <span className="text-sm text-center text-muted-foreground">
                        Tengo camiones disponibles
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.userType && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.userType.message}
                  </p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Continuar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
