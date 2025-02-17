
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
import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const cargaSchema = z.object({
  origen: z.string().min(2, "El origen es requerido"),
  destino: z.string().min(2, "El destino es requerido"),
  fechaCarga: z.string().min(1, "La fecha de carga es requerida"),
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
      destino: "",
      fechaCarga: "",
      tipoCarga: "",
      tipoCamion: "",
      tarifa: "",
      observaciones: "",
    },
  });

  const geocodeAddress = async (address: string): Promise<Coordinates> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyAyjXoR5-0I-FHD-4NwTvTrF7LWIciirbU`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  };

  const handleOrigenChange = async (value: string) => {
    const coords = await geocodeAddress(value);
    setOrigenCoords(coords);
  };

  const handleDestinoChange = async (value: string) => {
    const coords = await geocodeAddress(value);
    setDestinoCoords(coords);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Acceso denegado",
          description: "Debes iniciar sesión para publicar una carga",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate, toast]);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { error } = await supabase.from("cargas").insert({
        origen: data.origen,
        destino: data.destino,
        fecha_carga: new Date(data.fechaCarga).toISOString(),
        tipo_carga: data.tipoCarga,
        tipo_camion: data.tipoCamion,
        tarifa: parseFloat(data.tarifa),
        observaciones: data.observaciones || null,
        usuario_id: user.id,
        origen_lat: origenCoords.lat,
        origen_lng: origenCoords.lng,
        destino_lat: destinoCoords.lat,
        destino_lng: destinoCoords.lng,
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

  const mapContainerStyle = {
    width: "100%",
    height: "300px",
  };

  const center = {
    lat: -34.0,
    lng: -64.0,
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
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="origen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origen</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ciudad de origen" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              handleOrigenChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destino"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destino</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ciudad de destino" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleDestinoChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <LoadScript googleMapsApiKey="AIzaSyAyjXoR5-0I-FHD-4NwTvTrF7LWIciirbU">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={origenCoords || center}
                    zoom={4}
                  >
                    {origenCoords && (
                      <Marker
                        position={origenCoords}
                        draggable={true}
                        onDragEnd={(e) => {
                          setOrigenCoords({
                            lat: e.latLng!.lat(),
                            lng: e.latLng!.lng(),
                          });
                        }}
                        title="Origen"
                      />
                    )}
                    {destinoCoords && (
                      <Marker
                        position={destinoCoords}
                        draggable={true}
                        onDragEnd={(e) => {
                          setDestinoCoords({
                            lat: e.latLng!.lat(),
                            lng: e.latLng!.lng(),
                          });
                        }}
                        title="Destino"
                        icon={{
                          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                        }}
                      />
                    )}
                  </GoogleMap>
                </LoadScript>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fechaCarga"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Carga</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipoCarga"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Carga</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Palletizado, Granel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tipoCamion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Camión</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Semi, Chasis" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tarifa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tarifa Propuesta (ARS)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
