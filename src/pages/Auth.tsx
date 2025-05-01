
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AuthContainer from "@/components/auth/AuthContainer";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import FormDivider from "@/components/auth/FormDivider";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const { form, isSignUp, loading, handleSocialLogin, onSubmit, toggleMode } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    console.log("Auth page rendered, isSignUp:", isSignUp);
    
    // Debug the existing session on page load
    const checkExistingSession = async () => {
      try {
        // Debug Supabase auth directly
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log("Supabase getSession result:", { data: sessionData, error: sessionError });
        
        if (sessionError) {
          setDebugInfo(`Auth error: ${sessionError.message}`);
        }
        
        // Try direct API access (to debug CORS issues)
        try {
          const { data } = await fetch("https://yeyubdwclifbgbqivrsu.supabase.co/auth/v1/user", {
            headers: {
              "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleXViZHdjbGlmYmdicWl2cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTU3MjcsImV4cCI6MjA1NTI5MTcyN30.mjMAZTv9efiuTluZeVUKiR8T31NHwVCgJ0e8f3RBxnc",
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            },
            credentials: "include"
          }).then(r => r.json());
          console.log("Direct API session check result:", data);
        } catch (e) {
          console.error("Error checking direct session:", e);
          setDebugInfo(`CORS issue detected: ${e.message}`);
        }
      } catch (e) {
        console.error("Error checking session:", e);
        setDebugInfo(`Error: ${e.message}`);
      }
    };
    checkExistingSession();
    
    // Set up and clean up Supabase auth listener
    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, { user: session?.user?.email });
    });
    
    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, [isSignUp]);

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log("Form submit event triggered");
    e.preventDefault(); // Prevent default form submission
    
    // Debug form values before submission
    const values = form.getValues();
    console.log("Form values:", values);
    
    // Call the submit handler
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

            {debugInfo && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded">
                {debugInfo}
              </div>
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
