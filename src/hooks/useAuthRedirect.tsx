
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAuthRedirect = (redirectAfterLogin = "/", formData = null) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          
          if (error.message.includes("Failed to fetch") || error.message.includes("CORS")) {
            toast({
              title: "Error de conexión",
              description: "Hay un problema de CORS con el servidor de autenticación. Intenta usar una ventana de incógnito o deshabilitar extensiones del navegador.",
              variant: "destructive",
            });
          }
          
          return;
        }
        
        console.log("Session check result:", { 
          hasSession: !!session, 
          user: session?.user?.email 
        });
        
        if (session) {
          // Check if profile is complete for social logins
          if (session.user.app_metadata.provider && session.user.app_metadata.provider !== 'email') {
            console.log("Social login detected, checking profile completeness");
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('phone_number, user_type')
              .eq('id', session.user.id)
              .single();
            
            if (profileError) {
              console.error("Error checking profile:", profileError);
            }
            
            console.log("Profile data:", profileData);
            
            // If profile is incomplete, redirect to complete profile page
            if (!profileData?.phone_number || !profileData?.user_type) {
              console.log("Social login user with incomplete profile, redirecting to profile completion");
              navigate("/complete-profile");
              return;
            }
          }
          
          // Profile is complete, redirect to intended destination
          console.log("Active session found, redirecting to:", redirectAfterLogin);
          if (formData && redirectAfterLogin === '/publicar-carga') {
            navigate(redirectAfterLogin, { state: { formData } });
          } else {
            navigate(redirectAfterLogin);
          }
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        
        // Show a toast for network/CORS errors
        toast({
          title: "Error de conexión",
          description: "No se pudo verificar la sesión. Comprueba tu conexión a Internet.",
          variant: "destructive",
        });
      }
    };

    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      const error = searchParams.get("error");
      const code = searchParams.get("code");
      
      console.log("OAuth callback parameters:", { 
        error, 
        hasCode: !!code,
        fullUrl: window.location.href 
      });
      
      if (error) {
        toast({
          title: "Error en autenticación",
          description: error,
          variant: "destructive",
        });
      } else if (code) {
        try {
          // Wait a moment to ensure the session is fully established
          setTimeout(async () => {
            console.log("Processing OAuth callback with code");
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            console.log("Session after OAuth:", { 
              hasSession: !!session, 
              user: session?.user?.email,
              error: sessionError?.message 
            });
            
            if (sessionError) {
              console.error("Error getting session after OAuth:", sessionError);
              toast({
                title: "Error de autenticación",
                description: sessionError.message,
                variant: "destructive",
              });
            } else if (session) {
              // Check if profile is complete
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('phone_number, user_type')
                .eq('id', session.user.id)
                .single();
              
              if (profileError) {
                console.error("Error checking profile after OAuth:", profileError);
              }
              
              console.log("Profile data after OAuth:", profileData);
              
              // If profile is incomplete, redirect to complete profile page
              if (!profileData?.phone_number || !profileData?.user_type) {
                console.log("Social login user with incomplete profile, redirecting to profile completion");
                navigate("/complete-profile");
                return;
              }
              
              // Profile is complete, proceed with normal flow
              console.log("OAuth flow complete, redirecting to:", redirectAfterLogin);
              if (formData && redirectAfterLogin === '/publicar-carga') {
                navigate(redirectAfterLogin, { state: { formData } });
              } else {
                navigate(redirectAfterLogin);
              }
            }
          }, 300); // Give a little time for session to be fully established
        } catch (error) {
          console.error("Error in OAuth flow:", error);
          toast({
            title: "Error de autenticación",
            description: "Error procesando la autenticación. Por favor, inténtalo de nuevo.",
            variant: "destructive",
          });
        }
      }
    };

    console.log("useAuthRedirect hook initialized");
    checkSession();
    handleOAuthCallback();
  }, [navigate, redirectAfterLogin, formData, searchParams, toast]);

  // Return the setup auth listener to be used in the Auth page
  const setupAuthListener = () => {
    console.log("Setting up auth state listener");
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, { 
        hasSession: !!session, 
        user: session?.user?.email,
        eventType: event
      });
      
      if (event === "SIGNED_IN" && session) {
        // Use timeout to avoid potential deadlock with Supabase client
        setTimeout(async () => {
          try {
            // Check if profile is complete for social logins without redirecting unnecessarily
            if (session.user.app_metadata.provider && session.user.app_metadata.provider !== 'email') {
              console.log("Checking profile completeness for social login after sign in");
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('phone_number, user_type')
                .eq('id', session.user.id)
                .single();
              
              if (profileError) {
                console.error("Error checking profile after sign in:", profileError);
              }
              
              console.log("Profile data after sign in:", profileData);
              
              // Only redirect to profile completion if necessary
              if (!profileData?.phone_number || !profileData?.user_type) {
                console.log("Social login user with incomplete profile, redirecting to profile completion");
                navigate("/complete-profile");
                return;
              }
            }
            
            // Profile is already complete, proceed with normal flow
            console.log("User signed in with complete profile, redirecting to:", redirectAfterLogin);
            if (formData && redirectAfterLogin === '/publicar-carga') {
              navigate(redirectAfterLogin, { state: { formData } });
            } else {
              navigate(redirectAfterLogin);
            }
          } catch (error) {
            console.error("Error checking profile completeness:", error);
            // If we can't verify profile, assume it's incomplete and redirect to complete it
            navigate("/complete-profile");
          }
        }, 0); // Using 0 delay to defer execution but not delay it
      }
    });

    return authListener.subscription;
  };

  return { setupAuthListener };
};
