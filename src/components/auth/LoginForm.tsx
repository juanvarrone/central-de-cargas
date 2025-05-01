
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

type LoginFormProps = {
  form: UseFormReturn<any>;
  loading: boolean;
};

const LoginForm = ({ form, loading }: LoginFormProps) => {
  const [loginAttempted, setLoginAttempted] = useState(false);
  const { toast } = useToast();

  const handleLoginClick = () => {
    // Log info about the login attempt
    console.log("Login button clicked", { 
      email: form.getValues("email"), 
      passwordEntered: !!form.getValues("password") 
    });

    // Check network connection before proceeding
    const checkNetworkConnection = async () => {
      try {
        const networkTest = await fetch("https://httpbin.org/get")
          .then(res => res.ok ? "Network connection OK" : "Network issues detected")
          .catch(err => `Network error: ${err.message}`);
        console.log("Network test result:", networkTest);
      } catch (error) {
        console.error("Network test failed:", error);
      }
    };

    // Check if the browser is blocking third-party cookies
    const checkCookieAccess = () => {
      try {
        document.cookie = "testcookie=1; SameSite=None; Secure";
        const hasCookie = document.cookie.indexOf("testcookie=") !== -1;
        console.log("Cookie test:", hasCookie ? "Cookies allowed" : "Cookies might be blocked");
        if (!hasCookie) {
          toast({
            title: "Advertencia de cookies",
            description: "Tu navegador podría estar bloqueando cookies necesarias para el inicio de sesión",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Cookie test error:", error);
      }
    };

    // Run checks
    checkNetworkConnection();
    checkCookieAccess();
    setLoginAttempted(true);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="tu@email.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contraseña</FormLabel>
            <FormControl>
              <Input type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {loginAttempted && !loading && (
        <div className="flex items-center p-3 text-sm bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
          <span>
            Si tienes problemas para iniciar sesión, podría ser debido a bloqueos CORS o cookies. 
            Intenta en modo incógnito o con otro navegador.
          </span>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
        onClick={handleLoginClick}
      >
        {loading ? "Cargando..." : "Iniciar sesión"}
      </Button>
    </>
  );
};

export default LoginForm;
