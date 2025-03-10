
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";

const phoneSchema = z.object({
  phoneNumber: z.string()
    .min(8, "El número de teléfono debe tener al menos 8 dígitos")
    .regex(/^\+?[0-9\s\-()]+$/, "Ingrese un número de teléfono válido con formato internacional")
});

interface PhoneNumberFormProps {
  onSubmit: (phoneNumber: string) => Promise<void>;
  isLoading: boolean;
}

const PhoneNumberForm = ({ onSubmit, isLoading }: PhoneNumberFormProps) => {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof phoneSchema>) => {
    try {
      setFormError(null);
      await onSubmit(values.phoneNumber);
    } catch (error: any) {
      setFormError(error.message || "Error al guardar el número de teléfono");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Agregar número de teléfono
        </CardTitle>
        <CardDescription>
          Es necesario agregar un número de teléfono con WhatsApp para publicar disponibilidad de camiones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de teléfono (con código de país)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+54 9 11 1234 5678"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError && (
              <div className="text-sm font-medium text-destructive">
                {formError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar número"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PhoneNumberForm;
