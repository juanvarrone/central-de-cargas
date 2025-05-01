
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

export type AuthFormValues = z.infer<typeof authSchema>;

export const useAuthActions = (initialIsSignUp = false) => {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      console.log(`Starting ${provider} social login`);
      setLoading(true);
      
      // Log current location for debugging redirect issues
      console.log("Current location before social login:", window.location.href);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
          scopes: 'email profile',
        },
      });
      
      console.log("OAuth initiation result:", { data, error });
      
      if (error) throw error;
      console.log(`${provider} social login initiated, redirect URL:`, data?.url);
    } catch (error: any) {
      console.error("OAuth error:", error);
      toast({
        title: "Error de autenticación",
        description: error.message || "Error al iniciar sesión con " + provider,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values: AuthFormValues) => {
    console.log("Auth form submitted with values:", values);
    setLoading(true);
    
    try {
      if (isSignUp) {
        console.log("Attempting signup with:", values.email);
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

        console.log("Signup attempt result:", { data, error: signUpError?.message });
        
        if (signUpError) throw signUpError;

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
        console.log("Attempting login with:", values.email);
        
        // This will log any potential network issues
        const networkTestResult = await fetch("https://httpbin.org/get")
          .then(res => res.ok ? "Network connection OK" : "Network issues detected")
          .catch(err => `Network error: ${err.message}`);
        console.log("Network test before login:", networkTestResult);
        
        try {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
          });
          
          console.log("Login attempt result:", { 
            success: !!data.session, 
            user: data.user?.email,
            error: signInError?.message 
          });
          
          if (signInError) {
            throw signInError;
          }
          
          console.log("Login successful, redirecting to:", redirectAfterLogin);
          toast({
            title: "Inicio de sesión exitoso",
            description: "Bienvenido de vuelta.",
          });
          
          // Add a delay before navigation to ensure state updates
          setTimeout(() => {
            if (formData && redirectAfterLogin === '/publicar-carga') {
              navigate(redirectAfterLogin, { state: { formData } });
            } else {
              navigate(redirectAfterLogin);
            }
          }, 100);
        } catch (signInError: any) {
          console.error("Login error:", signInError);
          
          // Check if it's a CORS error
          if (signInError.message && (
              signInError.message.includes("CORS") || 
              signInError.message.includes("Failed to fetch") ||
              signInError.message.includes("NetworkError")
          )) {
            console.error("Detected possible CORS issue");
            toast({
              title: "Error de conexión",
              description: "No se pudo conectar con el servidor de autenticación. Esto puede deberse a bloqueos de CORS en tu navegador o problemas de red.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error de autenticación",
              description: signInError.message || "Error en la autenticación",
              variant: "destructive",
            });
          }
          throw signInError;
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error de autenticación",
        description: error.message || "Error en la autenticación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  });

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    form.reset();
  };

  return {
    form,
    isSignUp,
    loading,
    handleSocialLogin,
    onSubmit,
    toggleMode
  };
};
