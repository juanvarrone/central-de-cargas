
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LoginFormProps = {
  form: UseFormReturn<any>;
  loading: boolean;
};

const LoginForm = ({ form, loading }: LoginFormProps) => {
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [corsInfo, setCorsInfo] = useState<string | null>(null);
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
        
        if (networkTest !== "Network connection OK") {
          toast({
            title: "Problema de conexión",
            description: "Detectamos problemas con tu conexión a Internet. Verifica tu red.",
            variant: "destructive",
          });
        }
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
          setCorsInfo("Tu navegador podría estar bloqueando cookies necesarias para el inicio de sesión. Prueba con modo incógnito o desactiva las extensiones que bloquean cookies.");
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

    // Check for CORS issues
    const checkCorsIssues = async () => {
      try {
        // Try a simple OPTIONS request to the supabase auth endpoint
        const corsTest = await fetch("https://yeyubdwclifbgbqivrsu.supabase.co/auth/v1/token?grant_type=password", {
          method: "OPTIONS",
          headers: {
            "Content-Type": "application/json",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleXViZHdjbGlmYmdicWl2cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTU3MjcsImV4cCI6MjA1NTI5MTcyN30.mjMAZTv9efiuTluZeVUKiR8T31NHwVCgJ0e8f3RBxnc"
          }
        }).then(() => "CORS check passed")
          .catch(err => {
            console.error("CORS test failed:", err);
            return "CORS issues detected";
          });
          
        console.log("CORS test result:", corsTest);
        
        if (corsTest === "CORS issues detected") {
          setCorsInfo("Detectamos problemas de CORS con el servidor de autenticación. Intenta usar el modo incógnito o deshabilitar extensiones del navegador.");
        }
      } catch (error) {
        console.error("CORS test failed:", error);
      }
    };

    // Run checks
    checkNetworkConnection();
    checkCookieAccess();
    checkCorsIssues();
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

      {loginAttempted && corsInfo && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <Info className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-sm">
            {corsInfo}
          </AlertDescription>
        </Alert>
      )}

      {loginAttempted && !loading && !corsInfo && (
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
