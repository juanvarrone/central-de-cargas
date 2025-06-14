
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { PopoverClose } from "@radix-ui/react-popover";
import { Switch } from "@/components/ui/switch";
import LocationInputs from "./LocationInputs";

const alertFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  radius_km: z.coerce.number().min(1).max(500, {
    message: "El radio debe estar entre 1 y 500 km.",
  }),
  locations: z.array(z.string()).min(1, {
    message: "Debe agregar al menos una ubicación.",
  }),
  date_from: z.date().optional(),
  date_to: z.date().optional(),
  notify_new_loads: z.boolean().default(true),
  notify_available_trucks: z.boolean().default(true),
});

type AlertFormValues = z.infer<typeof alertFormSchema>;

interface AlertFormProps {
  onSubmit: (values: AlertFormValues) => void;
  loading: boolean;
  defaultValues?: Partial<AlertFormValues>;
}

const AlertForm = ({ onSubmit, loading, defaultValues }: AlertFormProps) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<string[]>(defaultValues?.locations || []);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(defaultValues?.date_from);
  const [dateTo, setDateTo] = useState<Date | undefined>(defaultValues?.date_to);

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      radius_km: defaultValues?.radius_km || 50,
      locations: defaultValues?.locations || [],
      date_from: defaultValues?.date_from,
      date_to: defaultValues?.date_to,
      notify_new_loads: defaultValues?.notify_new_loads ?? true,
      notify_available_trucks: defaultValues?.notify_available_trucks ?? true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
      setLocations(defaultValues.locations || []);
      setDateFrom(defaultValues.date_from);
      setDateTo(defaultValues.date_to);
    }
  }, [defaultValues, form]);

  const handleSubmit = (values: AlertFormValues) => {
    try {
      onSubmit(values);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al crear la alerta",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label>Nombre de la alerta</Label>
              <FormControl>
                <Input placeholder="Ej: Cargas en Buenos Aires" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="radius_km"
          render={({ field }) => (
            <FormItem>
              <Label>Radio de búsqueda (km)</Label>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locations"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <LocationInputs
                  value={field.value}
                  onChange={field.onChange}
                  maxLocations={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Label>Rango de fechas</Label>
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name="date_from"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Fecha inicial</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <CalendarComponent
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setDateFrom(date);
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_to"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Fecha final</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <CalendarComponent
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setDateTo(date);
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        disabled={(date) => 
                          dateFrom ? date < dateFrom : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border p-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Notificar nuevas cargas</h4>
            <p className="text-sm text-muted-foreground">
              Recibirás una notificación cuando se publique una nueva carga que
              coincida con tu alerta.
            </p>
          </div>
          <FormField
            control={form.control}
            name="notify_new_loads"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border p-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">
              Notificar camiones disponibles
            </h4>
            <p className="text-sm text-muted-foreground">
              Recibirás una notificación cuando haya camiones disponibles que
              coincidan con tu alerta.
            </p>
          </div>
          <FormField
            control={form.control}
            name="notify_available_trucks"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Alerta"}
          </Button>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AlertForm;
