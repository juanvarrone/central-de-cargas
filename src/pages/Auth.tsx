
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AuthContainer from "@/components/auth/AuthContainer";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import FormDivider from "@/components/auth/FormDivider";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const Auth = () => {
  const { form, isSignUp, loading, handleSocialLogin, onSubmit, toggleMode } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    console.log("Auth page rendered, isSignUp:", isSignUp);
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
