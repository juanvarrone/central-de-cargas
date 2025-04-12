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
import { useUserAlerts } from "@/hooks/useUserAlerts";
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
import { DateRange } from "react-day-picker";
import { PopoverClose } from "@radix-ui/react-popover";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const alertFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  radius_km: z.coerce.number().min(1).max(500, {
    message: "El radio debe estar entre 1 y 500 km.",
  }),
  selectedLocations: z.string().optional(),
  date_from: z.date().optional(),
  date_to: z.date().optional(),
  notify_new_loads: z.boolean().default(true),
  notify_available_trucks: z.boolean().default(true),
  comments: z.string().optional(),
});

type AlertFormValues = z.infer<typeof alertFormSchema>;

interface AlertFormProps {
  onSubmit: (values: AlertFormValues) => void;
  loading: boolean;
  defaultValues?: Partial<AlertFormValues>;
}

const AlertForm = ({ onSubmit, loading, defaultValues }: AlertFormProps) => {
  const { toast } = useToast();
  const [selectedLocations, setSelectedLocations] = useState<string>("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: defaultValues?.date_from,
    to: defaultValues?.date_to,
  });

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      radius_km: defaultValues?.radius_km || 50,
      selectedLocations: defaultValues?.selectedLocations || "",
      date_from: defaultValues?.date_from,
      date_to: defaultValues?.date_to,
      notify_new_loads: defaultValues?.notify_new_loads ?? true,
      notify_available_trucks: defaultValues?.notify_available_trucks ?? true,
      comments: defaultValues?.comments || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
      setDate({ from: defaultValues.date_from, to: defaultValues.date_to });
      setSelectedLocations(defaultValues.selectedLocations || "");
    }
  }, [defaultValues, form]);

  const handleSubmit = (values: AlertFormValues) => {
    try {
      let locations: string[] = [];
    
      if (values.selectedLocations && values.selectedLocations !== "") {
        // Ensure locations is always treated as a string before splitting
        locations = (values.selectedLocations as string).split(',');
      }
      
      const newAlert = {
        name: values.name,
        radius_km: values.radius_km,
        locations: locations,
        date_from: values.date_from?.toISOString() || null,
        date_to: values.date_to?.toISOString() || null,
        notify_new_loads: values.notify_new_loads,
        notify_available_trucks: values.notify_available_trucks,
      };

      onSubmit(newAlert);
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
        className="space-y-4"
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
          name="selectedLocations"
          render={({ field }) => (
            <FormItem>
              <Label>Ubicaciones (separadas por coma)</Label>
              <FormControl>
                <Textarea
                  placeholder="Ej: Buenos Aires, Cordoba, Rosario"
                  {...field}
                  value={selectedLocations}
                  onChange={(e) => {
                    setSelectedLocations(e.target.value);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_from"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Label>Rango de fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !date?.from && "text-muted-foreground"
                      )}
                    >
                      {date?.from ? (
                        date.to ? (
                          `${format(date.from, "LLL dd, y")} - ${format(
                            date.to,
                            "LLL dd, y"
                          )}`
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <DatePicker
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    disabled={loading}
                  />
                  <PopoverClose className="absolute top-2 right-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary data-[state=open]:text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18 6L6 18"></path>
                      <path d="M6 6L18 18"></path>
                    </svg>
                  </PopoverClose>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <Button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Guardar Alerta"}
        </Button>
      </form>
    </Form>
  );
};

export default AlertForm;
