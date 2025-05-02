
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LoginFormProps = {
  form: UseFormReturn<any>;
  loading: boolean;
};

const LoginForm = ({ form, loading }: LoginFormProps) => {
  const [diagnosticInfo, setDiagnosticInfo] = React.useState<string | null>(null);

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
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-sm">
          Si tienes problemas para iniciar sesión, prueba usando una ventana de incógnito o desactivando extensiones del navegador.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default LoginForm;
