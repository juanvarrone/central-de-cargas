
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Truck } from "lucide-react";
import CargoLocationFields from "@/components/CargoLocationFields";
import CargoDateFields from "@/components/cargo/CargoDateFields";
import CargoDateTypeField from "@/components/cargo/CargoDateTypeField";
import TruckDetailsFields from "@/components/truck/TruckDetailsFields";
import { camionSchema } from "@/types/truck";
import { useTruckSubmission } from "@/hooks/useTruckSubmission";
import CargoMap from "@/components/CargoMap";
import { useToast } from "@/hooks/use-toast";

const PublicarCamion = () => {
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [origenCoords, setOrigenCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submitTruck } = useTruckSubmission();

  const form = useForm<z.infer<typeof camionSchema>>({
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
      fecha_disponible_hasta: "",
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

  const handleOrigenChange = (value: string) => {
    setOrigen(value);
    form.setValue("origen", value);
  };

  const handleDestinoChange = (value: string) => {
    setDestino(value);
    form.setValue("destino", value);
  };

  const handleOrigenCoordsChange = (coords: { lat: number; lng: number } | null) => {
    setOrigenCoords(coords);
    if (coords) {
      form.setValue("origen_lat", coords.lat);
      form.setValue("origen_lng", coords.lng);
    }
  };

  const handleDestinoCoordsChange = (coords: { lat: number; lng: number } | null) => {
    setDestinoCoords(coords);
    if (coords) {
      form.setValue("destino_lat", coords.lat);
      form.setValue("destino_lng", coords.lng);
    }
  };

  const onSubmit = async (data: z.infer<typeof camionSchema>) => {
    try {
      await submitTruck(data);
      toast({
        title: "Camión publicado",
        description: "Tu disponibilidad de camión ha sido publicada correctamente.",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error al publicar camión:", error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al publicar tu disponibilidad de camión.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Publicar Disponibilidad de Camión
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la ruta</CardTitle>
                <CardDescription>
                  Ingrese el origen y destino donde está disponible su camión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <CargoLocationFields 
                    form={form} 
                    onOrigenChange={handleOrigenChange}
                    onDestinoChange={handleDestinoChange}
                  />
                  <CargoMap
                    origenCoords={origenCoords}
                    destinoCoords={destinoCoords}
                    onOrigenChange={handleOrigenCoordsChange}
                    onDestinoChange={handleDestinoCoordsChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fechas disponibles</CardTitle>
                <CardDescription>
                  Seleccione el rango de fechas en que su camión estará disponible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <CargoDateTypeField form={form} />
                  <CargoDateFields form={form} dateFromName="fecha_disponible_desde" dateToName="fecha_disponible_hasta" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles del camión</CardTitle>
                <CardDescription>
                  Ingrese las características de su camión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TruckDetailsFields form={form} />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/">Cancelar</Link>
              </Button>
              <Button type="submit">Publicar disponibilidad</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PublicarCamion;
