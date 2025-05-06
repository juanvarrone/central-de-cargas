
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Truck, AlertCircle } from "lucide-react";
import { useTruckSubmission } from "@/hooks/useTruckSubmission";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TruckFormData, camionSchema } from "@/types/truck";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import MapLocationInput from "@/components/MapLocationInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface UserTruck {
  id: string;
  tipo_camion: string;
  capacidad: string;
  refrigerado: boolean;
  patente_chasis: string;
}

const PublicarCamion = () => {
  const [loading, setLoading] = useState(false);
  const [userTrucks, setUserTrucks] = useState<UserTruck[]>([]);
  const [selectedTrucks, setSelectedTrucks] = useState<string[]>([]);
  const [loadingTrucks, setLoadingTrucks] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submitTruck } = useTruckSubmission();

  const form = useForm<TruckFormData>({
    resolver: zodResolver(camionSchema),
    defaultValues: {
      origen_provincia: "",
      radio_km: 50,
      fecha_permanente: false,
      fecha_disponible_desde: format(new Date(), "yyyy-MM-dd"),
      refrigerado: false,
    },
  });

  const isPermanent = form.watch("fecha_permanente");

  useEffect(() => {
    const fetchUserTrucks = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.error("Not authenticated:", sessionError);
          navigate("/auth");
          return;
        }
        
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", sessionData.session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Error",
            description: "No se pudo verificar tu tipo de usuario",
            variant: "destructive",
          });
          return;
        }
        
        if (profileData.user_type !== "camionero") {
          toast({
            title: "Acceso restringido",
            description: "Solo los usuarios de tipo camionero pueden publicar disponibilidad",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        const { data: trucks, error: trucksError } = await supabase
          .from("trucks")
          .select("id, tipo_camion, capacidad, refrigerado, patente_chasis")
          .eq("user_id", sessionData.session.user.id);

        if (trucksError) {
          throw trucksError;
        }

        setUserTrucks(trucks || []);
        if (trucks && trucks.length === 0) {
          toast({
            title: "No tienes camiones registrados",
            description: "Debes registrar al menos un camión para publicar disponibilidad",
            action: (
              <Button 
                variant="outline" 
                onClick={() => navigate("/agregar-camion")}
              >
                Agregar camión
              </Button>
            ),
          });
        }
      } catch (error) {
        console.error("Error fetching trucks:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus camiones",
          variant: "destructive",
        });
      } finally {
        setLoadingTrucks(false);
      }
    };

    fetchUserTrucks();
  }, [navigate, toast]);

  const onSubmit = async (data: TruckFormData) => {
    if (selectedTrucks.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un camión",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      // Add selected trucks to data
      data.selected_trucks = selectedTrucks;
      
      // Submit truck availability
      await submitTruck(data);
      
      setSubmitSuccess(true);
      toast({
        title: "Disponibilidad publicada",
        description: "Tu disponibilidad ha sido publicada exitosamente",
      });
      
      // Reset form after successful submission
      form.reset();
      setSelectedTrucks([]);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/buscar-camiones");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting availability:", error);
      toast({
        title: "Error",
        description: error.message || "Error al publicar disponibilidad",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTruckSelection = (truckId: string) => {
    setSelectedTrucks(prev => {
      if (prev.includes(truckId)) {
        return prev.filter(id => id !== truckId);
      } else {
        return [...prev, truckId];
      }
    });
  };

  if (loadingTrucks) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando tus camiones...</p>
        </div>
      </div>
    );
  }

  if (userTrucks.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
          <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold mb-4">No tienes camiones registrados</h2>
          <p className="mb-6 text-gray-600">
            Para publicar disponibilidad, primero debes registrar al menos un camión.
          </p>
          <Button onClick={() => navigate("/agregar-camion")}>
            Registrar un camión
          </Button>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-lg">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Truck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Disponibilidad publicada!</h2>
          <p className="text-gray-600 mb-6">
            Tu disponibilidad ha sido publicada con éxito y ya está visible para los dadores de carga.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate("/buscar-camiones")} className="w-full">
              Ver todos los camiones disponibles
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSubmitSuccess(false);
                form.reset();
                setSelectedTrucks([]);
              }} 
              className="w-full"
            >
              Publicar otra disponibilidad
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Publicar Disponibilidad de Camión</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Selecciona tus camiones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona uno o más camiones que estarán disponibles en la ubicación especificada.
                </p>
                <div className="space-y-2">
                  {userTrucks.map((truck) => (
                    <div
                      key={truck.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedTrucks.includes(truck.id)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                      onClick={() => handleTruckSelection(truck.id)}
                    >
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedTrucks.includes(truck.id)}
                          onCheckedChange={() => handleTruckSelection(truck.id)}
                          className="mr-3"
                        />
                        <div>
                          <p className="font-medium">
                            {truck.tipo_camion} - {truck.capacidad}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Patente: {truck.patente_chasis}
                            {truck.refrigerado && " • Refrigerado"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTrucks.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">
                    Debes seleccionar al menos un camión
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="origen_provincia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lugar donde tendrá el camión disponible *</FormLabel>
                          <FormControl>
                            <MapLocationInput
                              id="origen_provincia"
                              label=""
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Ingrese la ubicación donde estará disponible el camión"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label>Radio de kilometros</Label>
                      <div className="pt-4">
                        <Controller
                          control={form.control}
                          name="radio_km"
                          render={({ field }) => (
                            <div className="space-y-3">
                              <Slider
                                value={[field.value]}
                                min={0}
                                max={500}
                                step={10}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                              <div className="flex justify-between">
                                <span className="text-sm">{field.value} km</span>
                                <span className="text-sm text-muted-foreground">
                                  Max: 500km
                                </span>
                              </div>
                            </div>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Disponibilidad</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="fecha_permanente"
                            checked={form.watch("fecha_permanente")}
                            onCheckedChange={(checked) => {
                              form.setValue("fecha_permanente", checked === true);
                            }}
                          />
                          <label
                            htmlFor="fecha_permanente"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Tengo flota permanente aquí
                          </label>
                        </div>
                        
                        {!isPermanent && (
                          <div className="mt-4 space-y-4">
                            <FormField
                              control={form.control}
                              name="fecha_disponible_desde"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Disponible desde *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      min={format(new Date(), "yyyy-MM-dd")}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="fecha_disponible_hasta"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Disponible hasta</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="date"
                                      min={form.watch("fecha_disponible_desde") || format(new Date(), "yyyy-MM-dd")}
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="observaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Agregue información adicional sobre su disponibilidad..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Por ejemplo: disponibilidad, tipo de cargas, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || selectedTrucks.length === 0}
                      >
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {loading ? "Publicando..." : "Publicar disponibilidad"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>

        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Al publicar la disponibilidad de tu camión, estás 
                permitiendo que los dadores de carga puedan encontrarte
                cuando busquen transportes disponibles.
              </p>
              <h4>Consejos</h4>
              <ul className="space-y-1">
                <li>Se específico con tu ubicación para mejor visibilidad.</li>
                <li>Establece el radio de kilómetros adecuado según tu disponibilidad para desplazarte.</li>
                <li>Actualiza tu disponibilidad regularmente.</li>
                <li>Incluye información relevante en las observaciones.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicarCamion;
