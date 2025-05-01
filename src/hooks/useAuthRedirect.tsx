
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Check if profile is complete for social logins
          if (session.user.app_metadata.provider && session.user.app_metadata.provider !== 'email') {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('phone_number, user_type')
              .eq('id', session.user.id)
              .single();
            
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
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    // Handle OAuth callback
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
        try {
          // Wait a moment to ensure the session is fully established
          setTimeout(async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
              console.error("Error getting session after OAuth:", sessionError);
              toast({
                title: "Error",
                description: sessionError.message,
                variant: "destructive",
              });
            } else if (session) {
              // Check if profile is complete
              const { data: profileData } = await supabase
                .from('profiles')
                .select('phone_number, user_type')
                .eq('id', session.user.id)
                .single();
              
              // If profile is incomplete, redirect to complete profile page
              if (!profileData?.phone_number || !profileData?.user_type) {
                console.log("Social login user with incomplete profile, redirecting to profile completion");
                navigate("/complete-profile");
                return;
              }
              
              // Profile is complete, proceed with normal flow
              if (formData && redirectAfterLogin === '/publicar-carga') {
                navigate(redirectAfterLogin, { state: { formData } });
              } else {
                navigate(redirectAfterLogin);
              }
            }
          }, 300); // Give a little time for session to be fully established
        } catch (error) {
          console.error("Error in OAuth flow:", error);
        }
      }
    };

    checkSession();
    handleOAuthCallback();
  }, [navigate, redirectAfterLogin, formData, searchParams, toast]);

  // Return the setup auth listener to be used in the Auth page
  const setupAuthListener = () => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_IN" && session) {
        // Check if profile is complete for social logins without redirecting unnecessarily
        if (session.user.app_metadata.provider && session.user.app_metadata.provider !== 'email') {
          setTimeout(async () => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('phone_number, user_type')
                .eq('id', session.user.id)
                .single();
              
              // Only redirect to profile completion if necessary
              if (!profileData?.phone_number || !profileData?.user_type) {
                console.log("Social login user with incomplete profile, redirecting to profile completion");
                navigate("/complete-profile");
                return;
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
          }, 300);
        } else {
          // Regular email login, proceed with normal flow
          console.log("User signed in, redirecting to:", redirectAfterLogin);
          if (formData && redirectAfterLogin === '/publicar-carga') {
            navigate(redirectAfterLogin, { state: { formData } });
          } else {
            navigate(redirectAfterLogin);
          }
        }
      }
    });

    return authListener.subscription;
  };

  return { setupAuthListener };
};
