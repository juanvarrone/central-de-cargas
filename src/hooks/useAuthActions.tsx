
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const phoneRegex = /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

// Separate schemas for login and signup
const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const signupSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().min(2, "Ingresa tu nombre completo"),
  phoneNumber: z.string()
    .refine(val => !val || phoneRegex.test(val), {
      message: "Formato de teléfono inválido. Ej: (123) 456-7890"
    }),
  userType: z.enum(["dador", "camionero"]),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type AuthFormValues = LoginFormValues | SignupFormValues;

export const useAuthActions = (initialIsSignUp = false) => {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectAfterLogin = location.state?.from || "/";
  const formData = location.state?.formData || null;

  // Create the form with the appropriate schema based on isSignUp
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(isSignUp ? signupSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isSignUp ? {
        fullName: "",
        phoneNumber: "",
        userType: undefined as any, // This will be set by the user
      } : {}),
    },
    mode: "onSubmit"
  });

  const checkExistingSession = async (redirectPath = "/", formData = null) => {
    try {
      console.log("Checking for existing session...");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        return;
      }
      
      if (data.session) {
        console.log("Active session found, redirecting to:", redirectPath);
        if (formData && redirectPath === '/publicar-carga') {
          navigate(redirectPath, { state: { formData } });
        } else {
          navigate(redirectPath);
        }
      } else {
        console.log("No active session found");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      console.log(`Starting ${provider} social login`);
      setLoading(true);
      setAuthError(null);
      
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
      setAuthError(error.message || `Error al iniciar sesión con ${provider}`);
      toast({
        title: "Error de autenticación",
        description: error.message || `Error al iniciar sesión con ${provider}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: AuthFormValues) => {
    console.log("Form submitted with values:", values);
    
    setLoading(true);
    setAuthError(null);
    
    try {
      if (isSignUp) {
        // Type assertion since we know we have signup values when isSignUp is true
        const signupValues = values as SignupFormValues;
        console.log("Attempting signup with:", signupValues.email);
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: signupValues.email,
          password: signupValues.password,
          options: {
            data: {
              full_name: signupValues.fullName,
              phone_number: signupValues.phoneNumber,
              user_type: signupValues.userType,
            },
          },
        });

        console.log("Signup attempt result:", { data, error: signUpError?.message });
        
        if (signUpError) throw signUpError;

        if (data?.user?.id) {
          // Update the phone_number in the profile table
          if (signupValues.phoneNumber) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ 
                phone_number: signupValues.phoneNumber,
                user_type: signupValues.userType 
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
        // Type assertion since we know we have login values when isSignUp is false
        const loginValues = values as LoginFormValues;
        console.log("Attempting login with:", loginValues.email);
        
        try {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: loginValues.email,
            password: loginValues.password,
          });
          
          console.log("Login attempt result:", { 
            success: !!data.session, 
            user: data.user?.email,
            error: signInError?.message 
          });
          
          if (signInError) {
            throw signInError;
          }
          
          if (data.session) {
            console.log("Login successful, redirecting to:", redirectAfterLogin);
            toast({
              title: "Inicio de sesión exitoso",
              description: "Bienvenido de vuelta.",
            });
            
            if (formData && redirectAfterLogin === '/publicar-carga') {
              navigate(redirectAfterLogin, { state: { formData } });
            } else {
              navigate(redirectAfterLogin);
            }
          } else {
            throw new Error("No se pudo iniciar sesión. No se recibió sesión del servidor.");
          }
        } catch (signInError: any) {
          console.error("Login error:", signInError);
          setAuthError(signInError.message || "Error en la autenticación");
          
          toast({
            title: "Error de autenticación",
            description: signInError.message || "Error en la autenticación",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setAuthError(error.message || "Error en la autenticación");
      toast({
        title: "Error de autenticación",
        description: error.message || "Error en la autenticación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setAuthError(null);
    form.reset({
      email: "",
      password: "",
      ...(isSignUp ? {} : {
        fullName: "",
        phoneNumber: "",
        userType: undefined as any,
      }),
    });
  };

  return {
    form,
    isSignUp,
    loading,
    authError,
    handleSocialLogin,
    onSubmit: form.handleSubmit(onSubmit),
    toggleMode,
    checkExistingSession
  };
};
