
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
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
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
