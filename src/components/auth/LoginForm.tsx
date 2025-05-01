
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

type LoginFormProps = {
  form: UseFormReturn<any>;
  loading: boolean;
};

const LoginForm = ({ form, loading }: LoginFormProps) => {
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [corsInfo, setCorsInfo] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLoginClick = async () => {
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
        return networkTest === "Network connection OK";
      } catch (error) {
        console.error("Network test failed:", error);
        return false;
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
        return hasCookie;
      } catch (error) {
        console.error("Cookie test error:", error);
        return false;
      }
    };

    // Check for CORS issues
    const checkCorsIssues = async () => {
      try {
        // Try our Edge Function for CORS check
        const { data, error } = await supabase.functions.invoke('cors-headers');
        
        console.log("CORS edge function test result:", data, error);
        
        if (error) {
          console.error("CORS test failed:", error);
          setCorsInfo("Detectamos problemas de CORS con el servidor de autenticación. Intenta usar el modo incógnito o deshabilitar extensiones del navegador.");
          return false;
        }
        
        return true;
      } catch (error) {
        console.error("CORS test failed:", error);
        setCorsInfo("Detectamos problemas de CORS con el servidor de autenticación. Intenta usar el modo incógnito o deshabilitar extensiones del navegador.");
        return false;
      }
    };

    // Run checks
    const networkOk = await checkNetworkConnection();
    const cookiesOk = checkCookieAccess();
    const corsOk = await checkCorsIssues();
    
    setDebugInfo(`Red: ${networkOk ? "OK" : "Error"}, Cookies: ${cookiesOk ? "OK" : "Bloqueadas"}, CORS: ${corsOk ? "OK" : "Error"}`);
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

      {debugInfo && (
        <div className="p-3 text-xs font-mono bg-gray-100 border border-gray-200 rounded-md overflow-x-auto">
          <p>Diagnóstico: {debugInfo}</p>
        </div>
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
