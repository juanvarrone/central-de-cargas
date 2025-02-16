
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";

interface AlertasConfig {
  ubicaciones: string[];
  rangoFechaInicio: string;
  rangoFechaFin: string;
  radioKm: number;
  notificarNuevasCargas: boolean;
  notificarTransportistas: boolean;
  tiposCarga: string[];
}

const ConfigurarAlertas = () => {
  const { toast } = useToast();
  const form = useForm<AlertasConfig>({
    defaultValues: {
      ubicaciones: [],
      rangoFechaInicio: "",
      rangoFechaFin: "",
      radioKm: 50,
      notificarNuevasCargas: true,
      notificarTransportistas: true,
      tiposCarga: []
    }
  });

  const onSubmit = (data: AlertasConfig) => {
    console.log("Configuración de alertas:", data);
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias de notificación han sido actualizadas."
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Configurar Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="ubicaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicaciones de Interés</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Buenos Aires, Córdoba"
                          onChange={(e) => field.onChange(e.target.value.split(','))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="rangoFechaInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Desde</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rangoFechaFin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha Hasta</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="radioKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Radio de búsqueda (km)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          min={1}
                          max={500}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tiposCarga"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipos de Carga de Interés</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Palletizado, Granel, Contenedor"
                          onChange={(e) => field.onChange(e.target.value.split(','))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notificarNuevasCargas"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>Notificar Nuevas Cargas</FormLabel>
                          <p className="text-sm text-neutral-500">
                            Recibe alertas cuando aparezcan cargas que coincidan con tus criterios
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notificarTransportistas"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <FormLabel>Notificar Transportistas Disponibles</FormLabel>
                          <p className="text-sm text-neutral-500">
                            Recibe alertas cuando haya transportistas disponibles en tu zona
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Guardar Configuración</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfigurarAlertas;
