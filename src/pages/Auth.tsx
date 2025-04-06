
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const phoneRegex = /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const authSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().min(2, "Ingresa tu nombre completo").optional(),
  phoneNumber: z.string()
    .refine(val => !val || phoneRegex.test(val), {
      message: "Formato de teléfono inválido. Ej: (123) 456-7890"
    })
    .optional(),
  userType: z.enum(["dador", "camionero"]).optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams(); // Para capturar parámetros del callback
  const redirectAfterLogin = location.state?.from || "/";
  const formData = location.state?.formData || null;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      userType: undefined,
    },
  });

  useEffect(() => {
    console.log("Auth component mounted");
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("User is already logged in, redirecting to:", redirectAfterLogin);
          if (formData && redirectAfterLogin === '/publicar-carga') {
            navigate(redirectAfterLogin, { state: { formData } });
          } else {
            navigate(redirectAfterLogin);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    checkSession();

    // Manejar callback de OAuth
    const handleOAuthCallback = async () => {
      const error = searchParams.get("error");
      const code = searchParams.get("code");
      if (error) {
        toast({
          title: "Error en autenticación",
          description: error,
          variant: "destructive",
        });
      } else if (code) {
        console.log("OAuth code received, processing...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Error getting session after OAuth:", sessionError);
          toast({
            title: "Error",
            description: sessionError.message,
            variant: "destructive",
          });
        } else if (session) {
          console.log("Session established, redirecting to:", redirectAfterLogin);
          if (formData && redirectAfterLogin === '/publicar-carga') {
            navigate(redirectAfterLogin, { state: { formData } });
          } else {
            navigate(redirectAfterLogin);
          }
        }
      }
    };
    handleOAuthCallback();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      if (event === "SIGNED_IN" && session) {
        console.log("User signed in, redirecting to:", redirectAfterLogin);
        if (formData && redirectAfterLogin === '/publicar-carga') {
          navigate(redirectAfterLogin, { state: { formData } });
        } else {
          navigate(redirectAfterLogin);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, redirectAfterLogin, formData, searchParams, toast]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
          scopes: 'email profile',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("OAuth error:", error);
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión con " + provider,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: AuthFormValues) => {
    console.log("Form submitted", values);
    setLoading(true);
    try {
      if (isSignUp) {
        console.log("Signing up with:", values);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName,
              phone_number: values.phoneNumber,
              user_type: values.userType,
            },
          },
        });

        if (signUpError) throw signUpError;

        console.log("Sign up data:", data);

        if (data?.user?.id) {
          // Update the phone_number in the profile table
          if (values.phoneNumber) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ 
                phone_number: values.phoneNumber,
                user_type: values.userType 
              })
              .eq('id', data.user.id);
              
            if (profileError) {
              console.error("Error updating profile:", profileError);
            }
          }

          toast({
            title: "Registro exitoso",
            description: "Por favor, revisa tu email para confirmar tu cuenta.",
          });
        }
      } else {
        console.log("Logging in with:", values.email);
        const { error: signInError, data } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (signInError) {
          console.error("Sign in error:", signInError);
          throw signInError;
        }

        console.log("Sign in result:", data);
        
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de vuelta.",
        });
        
        if (formData && redirectAfterLogin === '/publicar-carga') {
          navigate(redirectAfterLogin, { state: { formData } });
        } else {
          navigate(redirectAfterLogin);
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Error en la autenticación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={20} />
          </Button>
          <CardTitle>{isSignUp ? "Crear cuenta" : "Iniciar sesión"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Ingresa tus datos para crear una cuenta"
              : "Ingresa tus credenciales para acceder"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              type="button" 
              className="w-full flex items-center justify-center gap-2" 
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>

            <Button 
              type="button" 
              className="w-full flex items-center justify-center gap-2" 
              variant="outline"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
              </svg>
              Continuar con Facebook
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-neutral-50 px-2 text-muted-foreground">
                  O continúa con email
                </span>
              </div>
            </div>

            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="tu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isSignUp && (
                  <>
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Tipo de usuario</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="dador" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Perfil Dador de Cargas
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="camionero" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Perfil Camionero
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || (isSignUp && !form.getValues("userType"))}
                  >
                    {loading
                      ? "Cargando..."
                      : isSignUp
                      ? "Crear cuenta"
                      : "Iniciar sesión"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      form.reset();
                    }}
                    disabled={loading}
                  >
                    {isSignUp
                      ? "¿Ya tienes cuenta? Inicia sesión"
                      : "¿No tienes cuenta? Regístrate"}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
