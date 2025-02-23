
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useState } from "react";
import CargoMap from "@/components/CargoMap";
import CargoLocationFields from "@/components/CargoLocationFields";
import CargoDetailsFields from "@/components/CargoDetailsFields";
import { geocodeAddress } from "@/utils/geocoding";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const cargaSchema = z.object({
  origen: z.string().min(2, "El origen es requerido"),
  origen_detalle: z.string().min(2, "El detalle del origen es requerido"),
  destino: z.string().min(2, "El destino es requerido"),
  destino_detalle: z.string().min(2, "El detalle del destino es requerido"),
  tipo_fecha: z.enum(["exacta", "rango"]),
  fecha_carga_desde: z.string().min(1, "La fecha de carga es requerida"),
  fecha_carga_hasta: z.string().optional(),
  cantidadCargas: z.number().min(1).max(10),
  tipoCarga: z.string().min(2, "El tipo de carga es requerido"),
  tipoCamion: z.string().min(2, "El tipo de camión es requerido"),
  tarifa: z.string().min(1, "La tarifa es requerida"),
  observaciones: z.string().optional(),
});

type Coordinates = {
  lat: number;
  lng: number;
} | null;

const PublicarCarga = () => {
  const [loading, setLoading] = useState(false);
  const [origenCoords, setOrigenCoords] = useState<Coordinates>(null);
  const [destinoCoords, setDestinoCoords] = useState<Coordinates>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(cargaSchema),
    defaultValues: {
      origen: "",
      origen_detalle: "",
      destino: "",
      destino_detalle: "",
      tipo_fecha: "exacta" as const,
      fecha_carga_desde: "",
      fecha_carga_hasta: "",
      cantidadCargas: 1,
      tipoCarga: "",
      tipoCamion: "",
      tarifa: "",
      observaciones: "",
    },
  });

  const handleOrigenChange = async (value: string) => {
    const coords = await geocodeAddress(value);
    setOrigenCoords(coords);
  };

  const handleDestinoChange = async (value: string) => {
    const coords = await geocodeAddress(value);
    setDestinoCoords(coords);
  };

  const onSubmit = async (data: z.infer<typeof cargaSchema>) => {
    if (!origenCoords || !destinoCoords) {
      toast({
        title: "Error",
        description: "No se pudieron obtener las coordenadas de origen o destino",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("cargas").insert({
        origen: data.origen,
        origen_detalle: data.origen_detalle,
        destino: data.destino,
        destino_detalle: data.destino_detalle,
        fecha_carga_desde: new Date(data.fecha_carga_desde).toISOString(),
        fecha_carga_hasta: data.fecha_carga_hasta ? new Date(data.fecha_carga_hasta).toISOString() : null,
        cantidad_cargas: data.cantidadCargas,
        tipo_carga: data.tipoCarga,
        tipo_camion: data.tipoCamion,
        tarifa: parseFloat(data.tarifa.replace(/\D/g, "")),
        observaciones: data.observaciones || null,
        origen_lat: origenCoords.lat,
        origen_lng: origenCoords.lng,
        destino_lat: destinoCoords.lat,
        destino_lng: destinoCoords.lng,
        estado: "disponible",
      });

      if (error) throw error;

      toast({
        title: "Carga publicada",
        description: "Tu carga ha sido publicada exitosamente",
      });
      navigate("/listado-cargas");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Publicar Nueva Carga</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <CargoLocationFields
                  form={form}
                  onOrigenChange={handleOrigenChange}
                  onDestinoChange={handleDestinoChange}
                />

                <CargoMap
                  origenCoords={origenCoords}
                  destinoCoords={destinoCoords}
                  onOrigenChange={setOrigenCoords}
                  onDestinoChange={setDestinoCoords}
                />

                <FormField
                  control={form.control}
                  name="tipo_fecha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de fecha</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="exacta" id="exacta" />
                            <label htmlFor="exacta">Fecha exacta</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rango" id="rango" />
                            <label htmlFor="rango">Rango de fecha</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fecha_carga_desde"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("tipo_fecha") === "exacta" ? "Fecha de Carga" : "Fecha Desde"}
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("tipo_fecha") === "rango" && (
                    <FormField
                      control={form.control}
                      name="fecha_carga_hasta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Hasta</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <CargoDetailsFields form={form} />

                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detalles adicionales, requisitos especiales, etc."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Link to="/listado-cargas">
                    <Button variant="outline">Cancelar</Button>
                  </Link>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Publicando..." : "Publicar Carga"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicarCarga;
