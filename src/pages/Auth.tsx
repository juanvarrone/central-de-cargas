
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AuthContainer from "@/components/auth/AuthContainer";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import FormDivider from "@/components/auth/FormDivider";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Auth = () => {
  const { form, isSignUp, loading, handleSocialLogin, onSubmit, toggleMode } = useAuth();

  useEffect(() => {
    console.log("Auth page rendered, isSignUp:", isSignUp);
    
    // Debug the existing session on page load
    const checkExistingSession = async () => {
      try {
        const { data } = await fetch("https://yeyubdwclifbgbqivrsu.supabase.co/auth/v1/user", {
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleXViZHdjbGlmYmdicWl2cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTU3MjcsImV4cCI6MjA1NTI5MTcyN30.mjMAZTv9efiuTluZeVUKiR8T31NHwVCgJ0e8f3RBxnc",
          },
          credentials: "include"
        }).then(r => r.json());
        console.log("Session check result:", data);
      } catch (e) {
        console.error("Error checking session:", e);
      }
    };
    checkExistingSession();
  }, [isSignUp]);

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log("Form submit event triggered");
    onSubmit(e);
  };

  return (
    <AuthContainer
      title={isSignUp ? "Crear cuenta" : "Iniciar sesión"}
      description={
        isSignUp
          ? "Ingresa tus datos para crear una cuenta"
          : "Ingresa tus credenciales para acceder"
      }
    >
      <div className="space-y-4">
        <SocialLoginButtons
          onGoogleLogin={() => handleSocialLogin('google')}
          onFacebookLogin={() => handleSocialLogin('facebook')}
          loading={loading}
        />
        
        <FormDivider />

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {isSignUp ? (
              <SignUpForm form={form} loading={loading} />
            ) : (
              <LoginForm form={form} loading={loading} />
            )}

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={toggleMode}
              disabled={loading}
            >
              {isSignUp
                ? "¿Ya tienes cuenta? Inicia sesión"
                : "¿No tienes cuenta? Regístrate"}
            </Button>
          </form>
        </Form>
      </div>
    </AuthContainer>
  );
};

export default Auth;
