
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "react-router-dom";
import CargoMap from "@/components/CargoMap";
import CargoLocationFields from "@/components/CargoLocationFields";
import CargoDetailsFields from "@/components/CargoDetailsFields";
import CargoDateTypeField from "./CargoDateTypeField";
import CargoDateFields from "./CargoDateFields";
import { useState, useEffect } from "react";
import { geocodeAddress } from "@/utils/geocoding";
import { CargaFormData, cargaSchema } from "@/types/cargo";

interface CargoFormProps {
  onSubmit: (data: CargaFormData) => Promise<void>;
  loading: boolean;
}

type Coordinates = {
  lat: number;
  lng: number;
} | null;

const CargoForm = ({ onSubmit, loading }: CargoFormProps) => {
  const [origenCoords, setOrigenCoords] = useState<Coordinates>(null);
  const [destinoCoords, setDestinoCoords] = useState<Coordinates>(null);
  const location = useLocation();
  const savedFormData = location.state?.formData || null;

  const form = useForm<CargaFormData>({
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

  // Restore saved form data if available
  useEffect(() => {
    if (savedFormData) {
      console.log("Restoring saved form data:", savedFormData);
      
      // Populate the form with saved data
      Object.entries(savedFormData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // @ts-ignore
          form.setValue(key, value);
        }
      });
      
      // Restore coordinates if available
      if (savedFormData.origen_lat && savedFormData.origen_lng) {
        setOrigenCoords({
          lat: savedFormData.origen_lat,
          lng: savedFormData.origen_lng
        });
      }
      
      if (savedFormData.destino_lat && savedFormData.destino_lng) {
        setDestinoCoords({
          lat: savedFormData.destino_lat,
          lng: savedFormData.destino_lng
        });
      }
    }
  }, [savedFormData, form]);

  const handleOrigenChange = async (value: string) => {
    const coords = await geocodeAddress(value);
    setOrigenCoords(coords);
    if (coords) {
      form.setValue("origen_lat", coords.lat);
      form.setValue("origen_lng", coords.lng);
    }
  };

  const handleDestinoChange = async (value: string) => {
    const coords = await geocodeAddress(value);
    setDestinoCoords(coords);
    if (coords) {
      form.setValue("destino_lat", coords.lat);
      form.setValue("destino_lng", coords.lng);
    }
  };

  const handleSubmit = async (data: CargaFormData) => {
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
