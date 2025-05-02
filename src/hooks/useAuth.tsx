
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthActions } from "./useAuthActions";

export const useAuth = () => {
  const location = useLocation();
  const redirectAfterLogin = location.state?.from || "/";
  const formData = location.state?.formData || null;
  
  // Pass false to start in login mode by default
  const authActions = useAuthActions(false);

  useEffect(() => {
    console.log("Auth hook initialized with redirectAfterLogin:", redirectAfterLogin);
    
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        await authActions.checkExistingSession(redirectAfterLogin, formData);
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    
    checkSession();
  }, [redirectAfterLogin, formData]);

  return {
    ...authActions
  };
};

// Re-export the AuthFormValues types for convenience
export type { LoginFormValues, SignupFormValues, AuthFormValues } from "./useAuthActions";
