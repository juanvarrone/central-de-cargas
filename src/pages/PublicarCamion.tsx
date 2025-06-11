import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Truck, AlertCircle, Plus, Info } from "lucide-react";
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import TruckAvailabilityCard from "@/components/truck/TruckAvailabilityCard";

interface UserTruck {
  id: string;
  tipo_camion: string;
  capacidad: string;
  refrigerado: boolean;
  patente_chasis: string;
  foto_chasis?: string | null;
  foto_chasis_thumbnail?: string | null;
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
          .select("id, tipo_camion, capacidad, refrigerado, patente_chasis, foto_chasis, foto_chasis_thumbnail")
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
      
      // Reset loading state immediately
      setLoading(false);
      
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
      // Make sure loading is set to false on error
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

  const handleAvailabilityChange = () => {
    // This will trigger a re-render of the availability cards
    // by updating a timestamp or similar state if needed
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

  // Tips for each section
  const tips = {
    location: "Sé específico con tu ubicación para mejor visibilidad.",
    radius: "Establece el radio de kilómetros adecuado según tu disponibilidad para desplazarte.",
    availability: "Marca esta opción si tienes camiones disponibles de forma permanente en esta ubicación.",
    date: "Actualiza tu disponibilidad regularmente.",
    observations: "Incluye información relevante que los dadores de carga deberían saber.",
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Truck Selection and Availability Display */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Selecciona tus camiones</CardTitle>
                <Button 
                  onClick={() => navigate("/agregar-camion")}
                  size="sm" 
                  variant="outline"
                  className="flex items-center"
                >
                  <Plus className="mr-1 h-4 w-4" /> Agregar camión
                </Button>
              </div>
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
                        <div 
                          className="mr-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTruckSelection(truck.id);
                          }}
                        >
                          <Checkbox
                            checked={selectedTrucks.includes(truck.id)}
                            onCheckedChange={() => handleTruckSelection(truck.id)}
                            className="pointer-events-auto"
                          />
                        </div>
                        <div className="flex items-center flex-1">
                          {(truck.foto_chasis_thumbnail || truck.foto_chasis) ? (
                            <img 
                              src={truck.foto_chasis_thumbnail || truck.foto_chasis} 
                              alt={`Camión ${truck.patente_chasis}`} 
                              className="w-12 h-12 object-cover rounded-md mr-3"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                              <Truck className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
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

          {/* Current Availability Display */}
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidades Actuales</CardTitle>
              <p className="text-sm text-muted-foreground">
                Aquí puedes ver y gestionar las disponibilidades activas de tus camiones
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {userTrucks.map((truck) => (
                <TruckAvailabilityCard
                  key={truck.id}
                  truck={truck}
                  onAvailabilityChange={handleAvailabilityChange}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Form Section */}
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <TooltipProvider>
                      <FormField
                        control={form.control}
                        name="origen_provincia"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center">
                              <FormLabel>Lugar donde tendrá el camión disponible *</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" className="p-0 h-auto ml-2">
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Sé específico con tu ubicación para mejor visibilidad.</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <FormControl>
                              <MapLocationInput
                                id="origen_provincia"
                                label=""
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Ingrese la ubicación donde estará disponible el camión"
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label>Radio de kilometros</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" className="p-0 h-auto ml-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{tips.radius}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
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
                        <div className="flex items-center">
                          <Label>Disponibilidad</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" className="p-0 h-auto ml-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{tips.availability}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
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
                                    <div className="flex items-center">
                                      <FormLabel>Disponible desde *</FormLabel>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" className="p-0 h-auto ml-2">
                                            <Info className="h-4 w-4 text-muted-foreground" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{tips.date}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
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
                            <div className="flex items-center">
                              <FormLabel>Observaciones</FormLabel>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" className="p-0 h-auto ml-2">
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{tips.observations}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
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
                    </TooltipProvider>

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
      </div>

      {/* Google Places Autocomplete Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            function initAutocomplete() {
              const input = document.getElementById('autocomplete-input');
              if (input && window.google && window.google.maps) {
                const autocomplete = new google.maps.places.Autocomplete(input, {
                  types: ['geocode'],
                  componentRestrictions: { country: 'ar' }
                });
                
                autocomplete.addListener('place_changed', function() {
                  const place = autocomplete.getPlace();
                  if (place && place.formatted_address) {
                    input.value = place.formatted_address;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                });
              }
            }
            
            if (window.google && window.google.maps) {
              initAutocomplete();
            } else {
              window.initAutocomplete = initAutocomplete;
            }
          `,
        }}
      />
      <script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBEcPYcF9RoIHVEYd6j_7c3vBWGylgTdUE&libraries=places&callback=initAutocomplete"
        async
        defer
      />
    </div>
  );
};

export default PublicarCamion;
