
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CargoDateTypeField from "@/components/cargo/CargoDateTypeField";
import { DatePicker } from "@/components/ui/date-picker";
import { useTruckSubmission } from "@/hooks/useTruckSubmission";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Plus, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TruckCard from "@/components/truck/TruckCard";
import { useTrucks, Truck as TruckType } from "@/hooks/useTrucks";
import { usePhoneValidation } from "@/hooks/usePhoneValidation";
import PhoneNumberForm from "@/components/truck/PhoneNumberForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PublicarCamion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submitTruck } = useTruckSubmission();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateType, setDateType] = useState<"exacta" | "rango">("exacta");
  const [selectedCamion, setSelectedCamion] = useState<string>("");
  const { trucks, isLoading, error, user } = useTrucks();
  const { hasValidPhone, phoneNumber, isLoading: isPhoneLoading, updatePhoneNumber } = usePhoneValidation();
  
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
      // These were removed from schema validation but still needed for the API
      origen: "",
      origen_detalle: "",
      destino: "",
      destino_detalle: "",
    },
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        toast({
          title: "Acceso restringido",
          description: "Debe iniciar sesión para publicar un camión",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSelectCamion = (camionId: string) => {
    setSelectedCamion(camionId);
    const selectedTruck = trucks.find(c => c.id === camionId);
    
    if (selectedTruck) {
      form.setValue('tipo_camion', selectedTruck.tipo_camion);
      form.setValue('capacidad', selectedTruck.capacidad);
      form.setValue('refrigerado', selectedTruck.refrigerado);
    }
  };

  const handleAddNewCamion = () => {
    navigate("/agregar-camion");
  };

  const handleDateTypeChange = (type: "exacta" | "rango") => {
    setDateType(type);
    form.setValue("tipo_fecha", type);
    if (type === "exacta") {
      form.setValue("fecha_disponible_hasta", "");
    }
  };

  const handlePhoneSubmit = async (phoneNumber: string) => {
    try {
      await updatePhoneNumber(phoneNumber);
      toast({
        title: "Teléfono actualizado",
        description: "Su número de teléfono se ha guardado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar número de teléfono",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: TruckFormData) => {
    if (!selectedCamion) {
      toast({
        title: "Error",
        description: "Debe seleccionar un camión",
        variant: "destructive",
      });
      return;
    }
    
    if (!hasValidPhone) {
      toast({
        title: "Error",
        description: "Debe agregar un número de teléfono válido con WhatsApp",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Set origin and destination from province and city
      data.origen = `${data.origen_provincia}, ${data.origen_ciudad || ''}`.trim();
      data.destino = `${data.destino_provincia}, ${data.destino_ciudad || ''}`.trim();
      
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

  const showPhoneForm = !isPhoneLoading && !hasValidPhone;
  const showTruckForm = !isPhoneLoading && hasValidPhone;

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

      {isPhoneLoading ? (
        <div className="py-12 text-center">Cargando información de usuario...</div>
      ) : showPhoneForm ? (
        <div className="max-w-md mx-auto">
          <PhoneNumberForm onSubmit={handlePhoneSubmit} isLoading={isSubmitting} />
        </div>
      ) : showTruckForm && (
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
                    <div className="grid grid-cols-1 gap-4 mb-4 max-h-80 overflow-y-auto">
                      {isLoading ? (
                        <div className="py-4 text-center">Cargando camiones...</div>
                      ) : error ? (
                        <div className="py-4 text-center text-destructive">{error}</div>
                      ) : trucks.length === 0 ? (
                        <div className="py-4 text-center">No tiene camiones registrados</div>
                      ) : (
                        trucks.map((truck) => (
                          <TruckCard
                            key={truck.id}
                            truck={truck}
                            onSelect={handleSelectCamion}
                            isSelected={selectedCamion === truck.id}
                          />
                        ))
                      )}
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
                  
                  {!selectedCamion && (
                    <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Seleccionar camión</AlertTitle>
                      <AlertDescription>
                        Es necesario seleccionar un camión para continuar
                      </AlertDescription>
                    </Alert>
                  )}
                  
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
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedCamion || !hasValidPhone}
                className="px-6 py-2 text-base"
              >
                {isSubmitting ? "Publicando..." : "Publicar Disponibilidad"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default PublicarCamion;
