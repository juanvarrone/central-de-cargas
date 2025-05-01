
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthActions } from "./useAuthActions";
import { useAuthRedirect } from "./useAuthRedirect";

export const useAuth = () => {
  const location = useLocation();
  const redirectAfterLogin = location.state?.from || "/";
  const formData = location.state?.formData || null;
  
  const { setupAuthListener } = useAuthRedirect(redirectAfterLogin, formData);
  const authActions = useAuthActions(false);

  useEffect(() => {
    const subscription = setupAuthListener();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    ...authActions,
    authError: authActions.authError
  };
};

// Re-export the AuthFormValues type for convenience
export type { AuthFormValues } from "./useAuthActions";
