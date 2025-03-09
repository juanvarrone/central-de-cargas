
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { camionSchema, TruckFormData } from "@/types/truck";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import CargoLocationFields from "@/components/CargoLocationFields";
import TruckDetailsFields from "@/components/truck/TruckDetailsFields";
import CargoDateTypeField from "@/components/cargo/CargoDateTypeField";
import { DatePicker } from "@/components/ui/date-picker";
import { useTruckSubmission } from "@/hooks/useTruckSubmission";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";

const PublicarCamion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submitTruck } = useTruckSubmission();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateType, setDateType] = useState<"exacta" | "rango">("exacta");

  const form = useForm<TruckFormData>({
    resolver: zodResolver(camionSchema),
    defaultValues: {
      origen: "",
      origen_detalle: "",
      origen_provincia: "",
      origen_ciudad: "",
      destino: "",
      destino_detalle: "",
      destino_provincia: "",
      destino_ciudad: "",
      tipo_fecha: "exacta",
      fecha_disponible_desde: "",
      tipo_camion: "",
      capacidad: "",
      refrigerado: false,
      observaciones: "",
      radio_km: 50,
      origen_lat: 0,
      origen_lng: 0,
      destino_lat: 0,
      destino_lng: 0,
    },
  });

  const onSubmit = async (data: TruckFormData) => {
    try {
      setIsSubmitting(true);
      await submitTruck(data);
      toast({
        title: "Éxito",
        description: "Camión publicado correctamente",
      });
      navigate("/buscar-cargas");
    } catch (error: any) {
      console.error("Error submitting truck:", error);
      toast({
        title: "Error",
        description: error.message || "Error al publicar camión",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateTypeChange = (type: "exacta" | "rango") => {
    setDateType(type);
    form.setValue("tipo_fecha", type);
    if (type === "exacta") {
      form.setValue("fecha_disponible_hasta", "");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center space-x-2 mb-6">
        <Truck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Publicar Disponibilidad de Camión</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Localizaciones */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Ruta</h2>
              <Separator />
              
              <CargoLocationFields
                form={form}
                onOrigenChange={(value) => {
                  console.log("Origen changed:", value);
                }}
                onDestinoChange={(value) => {
                  console.log("Destino changed:", value);
                }}
              />
            </div>

            {/* Detalles */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Detalles del Camión</h2>
              <Separator />
              
              <TruckDetailsFields form={form} />
              
              <div className="space-y-4">
                <FormLabel>Fechas de Disponibilidad</FormLabel>
                
                <CargoDateTypeField 
                  form={form}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fecha_disponible_desde"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {dateType === "exacta" ? "Fecha Disponible" : "Desde"}
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => 
                              field.onChange(date ? date.toISOString() : "")
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {dateType === "rango" && (
                    <FormField
                      control={form.control}
                      name="fecha_disponible_hasta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hasta</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value ? new Date(field.value) : undefined}
                              onChange={(date) => 
                                field.onChange(date ? date.toISOString() : "")
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="radio_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Radio máximo (km)</FormLabel>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="10"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="w-12 text-center">{field.value}km</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="refrigerado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Camión Refrigerado</FormLabel>
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
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalles adicionales sobre el servicio ofrecido"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publicando..." : "Publicar Disponibilidad"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PublicarCamion;
