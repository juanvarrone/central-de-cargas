
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Info, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

type LoginFormProps = {
  form: UseFormReturn<any>;
  loading: boolean;
  onForgotPassword?: () => void;
};

const LoginForm = ({ form, loading, onForgotPassword }: LoginFormProps) => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Run connection diagnostics on component mount
  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        // Test basic network connectivity
        const networkTest = await fetch('https://www.google.com', { 
          method: 'HEAD',
          mode: 'no-cors' 
        });
        const networkOk = networkTest.type === 'opaque' ? 'OK' : 'Error';
        
        // Test cookies functionality
        const cookiesEnabled = navigator.cookieEnabled ? 'OK' : 'Disabled';
        
        // Test CORS with Supabase
        let corsStatus;
        try {
          const { data, error } = await supabase.auth.getSession();
          corsStatus = error && error.message?.includes('CORS') ? 'Error' : 'OK';
        } catch (e) {
          corsStatus = 'Error';
        }
        
        setDiagnosticInfo(`Red: ${networkOk}, Cookies: ${cookiesEnabled}, CORS: ${corsStatus}`);
      } catch (error) {
        setDiagnosticInfo(`Error en diagnóstico: ${error}`);
      }
    };

    runDiagnostics();
  }, []);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  {...field} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-10 w-10"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {onForgotPassword && (
        <Button
          type="button"
          variant="link"
          className="p-0 h-auto font-normal text-right w-full"
          onClick={onForgotPassword}
        >
          ¿Olvidaste tu contraseña?
        </Button>
      )}

      {diagnosticInfo && (
        <div className="p-3 text-xs font-mono bg-gray-100 border border-gray-200 rounded-md overflow-x-auto">
          <p>Diagnóstico: {diagnosticInfo}</p>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
      >
        {loading ? "Cargando..." : "Iniciar sesión"}
      </Button>
      
    </>
  );
};

export default LoginForm;
