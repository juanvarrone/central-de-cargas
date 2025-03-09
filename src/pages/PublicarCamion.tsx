
import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CargoDateTypeField from "@/components/cargo/CargoDateTypeField";
import { DatePicker } from "@/components/ui/date-picker";
import { useTruckSubmission } from "@/hooks/useTruckSubmission";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

interface MyCamion {
  id: string;
  nombre: string;
  tipo_camion: string;
  capacidad: string;
  refrigerado: boolean;
}

const PublicarCamion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submitTruck } = useTruckSubmission();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateType, setDateType] = useState<"exacta" | "rango">("exacta");
  const [selectedCamion, setSelectedCamion] = useState<string>("");
  const [misCamiones, setMisCamiones] = useState<MyCamion[]>([]);
  const [provincias] = useState([
    "Buenos Aires", "Ciudad Autónoma de Buenos Aires", "Catamarca", "Chaco", "Chubut", 
    "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", 
    "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", 
    "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", 
    "Tierra del Fuego", "Tucumán"
  ]);

  const form = useForm<TruckFormData>({
    resolver: zodResolver(camionSchema),
    defaultValues: {
      origen_provincia: "",
      origen_ciudad: "",
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
      // Removing these fields as requested
      origen: "",
      origen_detalle: "",
      destino: "",
      destino_detalle: "",
    },
  });

  useEffect(() => {
    // Simulate fetching user's trucks
    // This should be replaced with actual supabase fetch
    const fetchMisCamiones = async () => {
      // Replace with actual fetch from supabase
      // For now, using placeholder data
      setMisCamiones([
        { id: '1', nombre: 'Mi camión 1', tipo_camion: 'semi', capacidad: '30', refrigerado: true },
        { id: '2', nombre: 'Mi camión 2', tipo_camion: 'chasis', capacidad: '15', refrigerado: false },
      ]);
    };

    fetchMisCamiones();
  }, []);

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

  const handleSelectCamion = (camionId: string) => {
    setSelectedCamion(camionId);
    const selectedTruck = misCamiones.find(c => c.id === camionId);
    
    if (selectedTruck) {
      form.setValue('tipo_camion', selectedTruck.tipo_camion);
      form.setValue('capacidad', selectedTruck.capacidad);
      form.setValue('refrigerado', selectedTruck.refrigerado);
    }
  };

  const handleAddNewCamion = () => {
    // Redirect to a new form for adding trucks
    toast({
      title: "Información",
      description: "Esta funcionalidad estará disponible próximamente",
    });
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
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
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
              
              <div className="space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="origen_provincia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provincia de origen</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione provincia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {provincias.map((provincia) => (
                                <SelectItem key={provincia} value={provincia}>
                                  {provincia}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="origen_ciudad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad de origen</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              placeholder="Ciudad de origen (opcional)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="destino_provincia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provincia de destino</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione provincia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {provincias.map((provincia) => (
                                <SelectItem key={provincia} value={provincia}>
                                  {provincia}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="destino_ciudad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad de destino</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              placeholder="Ciudad de destino (opcional)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Seleccionar camión</h2>
              <Separator />
              
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Mis camiones</FormLabel>
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    {misCamiones.map((camion) => (
                      <Card 
                        key={camion.id}
                        className={`cursor-pointer transition-colors ${selectedCamion === camion.id ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => handleSelectCamion(camion.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{camion.nombre}</h3>
                              <p className="text-sm text-muted-foreground">
                                {camion.tipo_camion} - {camion.capacidad} ton.
                                {camion.refrigerado && " - Refrigerado"}
                              </p>
                            </div>
                            {selectedCamion === camion.id && (
                              <div className="h-3 w-3 rounded-full bg-primary"></div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={handleAddNewCamion}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar nuevo camión
                  </Button>
                </FormItem>
                
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
