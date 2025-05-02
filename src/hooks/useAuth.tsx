
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthActions } from "./useAuthActions";

export const useAuth = () => {
  const location = useLocation();
  const redirectAfterLogin = location.state?.from || "/";
  const formData = location.state?.formData || null;
  
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
  }, []);

  return {
    ...authActions,
    authError: authActions.authError
  };
};

// Re-export the AuthFormValues type for convenience
export type { AuthFormValues } from "./useAuthActions";
