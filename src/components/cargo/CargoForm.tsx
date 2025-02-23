
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import CargoMap from "@/components/CargoMap";
import CargoLocationFields from "@/components/CargoLocationFields";
import CargoDetailsFields from "@/components/CargoDetailsFields";
import CargoDateTypeField from "./CargoDateTypeField";
import CargoDateFields from "./CargoDateFields";
import { useState } from "react";
import { geocodeAddress } from "@/utils/geocoding";

export const cargaSchema = z.object({
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

interface CargoFormProps {
  onSubmit: (data: z.infer<typeof cargaSchema>) => Promise<void>;
  loading: boolean;
}

const CargoForm = ({ onSubmit, loading }: CargoFormProps) => {
  const [origenCoords, setOrigenCoords] = useState<Coordinates>(null);
  const [destinoCoords, setDestinoCoords] = useState<Coordinates>(null);

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

  const handleSubmit = async (data: z.infer<typeof cargaSchema>) => {
    if (!origenCoords || !destinoCoords) {
      return;
    }

    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        <CargoDateTypeField form={form} />
        <CargoDateFields form={form} />
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
  );
};

export default CargoForm;
