
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AuthContainer from "@/components/auth/AuthContainer";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import FormDivider from "@/components/auth/FormDivider";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const { form, isSignUp, loading, handleSocialLogin, onSubmit, toggleMode } = useAuth();

  console.log("Auth page rendered, isSignUp:", isSignUp);

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
          <form onSubmit={onSubmit} className="space-y-4">
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
