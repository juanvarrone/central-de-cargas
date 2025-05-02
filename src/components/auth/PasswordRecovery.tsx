
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";

const recoveryFormSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
});

type RecoveryFormValues = z.infer<typeof recoveryFormSchema>;

interface PasswordRecoveryProps {
  onBackToLogin: () => void;
}

const PasswordRecovery = ({ onBackToLogin }: PasswordRecoveryProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoveryFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: RecoveryFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (resetError) {
        throw resetError;
      }

      setEmailSent(true);
      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer tu contraseña",
      });
    } catch (err: any) {
      console.error("Error sending recovery email:", err);
      setError(err.message || "Error al enviar el email. Intenta nuevamente.");
      toast({
        title: "Error",
        description: err.message || "Error al enviar el email. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {emailSent ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-green-50 rounded-md border border-green-200 mb-4">
            <p className="text-green-800">
              Hemos enviado un enlace para restablecer tu contraseña a tu correo.
              Por favor revisa tu bandeja de entrada.
            </p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={onBackToLogin}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBackToLogin}
                disabled={loading}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Enviando..." : "Recuperar contraseña"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default PasswordRecovery;
