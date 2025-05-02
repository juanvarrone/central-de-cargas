
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AuthContainer from "@/components/auth/AuthContainer";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import FormDivider from "@/components/auth/FormDivider";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuthActions } from "@/hooks/useAuthActions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import PasswordRecovery from "@/components/auth/PasswordRecovery";

const Auth = () => {
  const { form, isSignUp, loading, authError, handleSocialLogin, onSubmit, toggleMode } = useAuthActions();
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

  useEffect(() => {
    console.log("Auth page rendered, isSignUp:", isSignUp);
  }, [isSignUp]);

  const togglePasswordRecovery = () => {
    setShowPasswordRecovery(!showPasswordRecovery);
  };

  return (
    <AuthContainer
      title={showPasswordRecovery 
        ? "Recuperar contraseña" 
        : isSignUp 
          ? "Crear cuenta" 
          : "Iniciar sesión"
      }
      description={
        showPasswordRecovery
          ? "Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña"
          : isSignUp
            ? "Ingresa tus datos para crear una cuenta"
            : "Ingresa tus credenciales para acceder"
      }
    >
      <div className="space-y-4">
        {showPasswordRecovery ? (
          <PasswordRecovery 
            onBackToLogin={togglePasswordRecovery}
          />
        ) : (
          <>
            <SocialLoginButtons
              onGoogleLogin={() => handleSocialLogin('google')}
              onFacebookLogin={() => handleSocialLogin('facebook')}
              loading={loading}
            />
            
            <FormDivider />

            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                {isSignUp ? (
                  <SignUpForm form={form} loading={loading} />
                ) : (
                  <LoginForm 
                    form={form} 
                    loading={loading}
                    onForgotPassword={togglePasswordRecovery}
                  />
                )}

                {authError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
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
          </>
        )}
      </div>
    </AuthContainer>
  );
};

export default Auth;
