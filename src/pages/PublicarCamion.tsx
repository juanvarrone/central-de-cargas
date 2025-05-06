
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Truck, Plus } from "lucide-react";
import { TruckFormData } from "@/types/truck";
import { useTruckSubmission } from "@/hooks/useTruckSubmission";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { camionSchema } from "@/types/truck";
import { DatePicker } from "@/components/ui/date-picker";
import { useTrucks } from "@/hooks/useTrucks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { usePlacesAutocomplete } from "@/utils/geocoding";
import { Script } from "@/components/ui/script";

const PublicarCamion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const { submitTruck } = useTruckSubmission();
  const { trucks, isLoading: trucksLoading } = useTrucks();
  const [selectedTruckIds, setSelectedTruckIds] = useState<string[]>([]);
  const [disponibilidadTipo, setDisponibilidadTipo] = useState<'permanente' | 'temporal'>('temporal');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  
  // Integration with Google Places
  const { place } = usePlacesAutocomplete(scriptLoaded ? locationInputRef : { current: null });
  
  // Set up form with validation
  const form = useForm<TruckFormData>({
    resolver: zodResolver(camionSchema),
    defaultValues: {
      origen_provincia: '',
      origen_ciudad: '',
      radio_km: 50,
      origen_lat: 0,
      origen_lng: 0,
      fecha_disponible_desde: '',
      fecha_disponible_hasta: '',
    }
  });

  // Update coordinates when place changes
  useEffect(() => {
    if (place && place.geometry && place.geometry.location) {
      form.setValue('origen_lat', place.geometry.location.lat());
      form.setValue('origen_lng', place.geometry.location.lng());
      
      // Get address components
      const addressComponents = place.address_components || [];
      
      // Find city and state/province
      let city = '';
      let province = '';
      
      for (const component of addressComponents) {
        const types = component.types;
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          province = component.long_name;
        }
      }
      
      // If we found both city and province
      if (province) {
        form.setValue('origen_provincia', place.formatted_address || province);
      }
      if (city) {
        form.setValue('origen_ciudad', city);
      }
    }
  }, [place, form]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          toast({
            title: "Acceso restringido",
            description: "Debe iniciar sesión para acceder a esta página",
            variant: "destructive",
          });
          navigate("/auth", { state: { from: "/publicar-camion" } });
          return;
        }
        
        // Check if user is a transportista/camionero
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          console.error("Error checking profile:", profileError);
          toast({
            title: "Error",
            description: "No se pudo verificar su perfil de usuario",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        // Allow access for transportista, camionero or admin
        if (profileData.user_type === 'transportista' || 
            profileData.user_type === 'camionero' || 
            profileData.user_type === 'admin') {
          setLoading(false);
        } else {
          toast({
            title: "Acceso restringido",
            description: "No tienes permisos para publicar disponibilidad de camiones. Esta funcionalidad es solo para Transportistas y Administradores.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async (data: TruckFormData) => {
    try {
      // Validate that at least one truck is selected
      if (selectedTruckIds.length === 0) {
        toast({
          title: "Error",
          description: "Debe seleccionar al menos un camión",
          variant: "destructive",
        });
        return;
      }
      
      setLoading(true);
      
      // For each selected truck, submit availability
      for (const truckId of selectedTruckIds) {
        const selectedTruck = trucks.find(truck => truck.id === truckId);
        
        if (selectedTruck) {
          // Merge truck data with form data
          const submissionData = {
            ...data,
            tipo_camion: selectedTruck.tipo_camion,
            capacidad: selectedTruck.capacidad,
            refrigerado: selectedTruck.refrigerado,
            // If permanente, set fecha_hasta to null
            fecha_disponible_hasta: disponibilidadTipo === 'permanente' ? null : data.fecha_disponible_hasta,
            // Use origen_provincia as the location
            destino_provincia: '', // Clear destination as it's no longer needed
          };
          
          await submitTruck(submissionData);
        }
      }
      
      toast({
        title: "Disponibilidad publicada",
        description: `Disponibilidad de ${selectedTruckIds.length} camión(es) publicada exitosamente`,
      });
      navigate("/mis-camiones");
    } catch (error: any) {
      console.error("Error submitting truck:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar la disponibilidad del camión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTruckSelection = (truckId: string) => {
    setSelectedTruckIds(prev => {
      if (prev.includes(truckId)) {
        return prev.filter(id => id !== truckId);
      } else {
        return [...prev, truckId];
      }
    });
  };

  if (loading || authLoading || trucksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=places"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Publicar Disponibilidad de Camión</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="mr-2 h-6 w-6" />
              Registrar disponibilidad de transporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Complete el formulario para publicar la disponibilidad de su camión y permitir que dadores de carga puedan contactarlo.
            </p>
            
            <div className="mb-6">
              <div className="mb-4">
                <Label className="text-lg font-medium mb-2 block">Seleccione uno o más camiones</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                  {trucks.length === 0 ? (
                    <p className="text-muted-foreground col-span-full">No tiene camiones registrados</p>
                  ) : (
                    trucks.map((truck) => (
                      <div 
                        key={truck.id} 
                        className={`border rounded-md p-3 cursor-pointer ${
                          selectedTruckIds.includes(truck.id) ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                        onClick={() => handleTruckSelection(truck.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{truck.tipo_camion}</div>
                            <div className="text-sm text-muted-foreground">
                              {truck.patente_chasis}
                              {truck.refrigerado ? " (Refrigerado)" : ""}
                            </div>
                            <div className="text-sm text-muted-foreground">{truck.capacidad}</div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border ${
                            selectedTruckIds.includes(truck.id) 
                              ? 'bg-primary border-primary' 
                              : 'border-gray-400'
                          }`}>
                            {selectedTruckIds.includes(truck.id) && (
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="white" 
                                className="w-5 h-5"
                              >
                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link to="/agregar-camion">
                  <Button variant="outline" className="w-full md:w-auto">
                    <Plus size={16} className="mr-2" />
                    Agregar nuevo camión
                  </Button>
                </Link>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-6">
                  {/* Location with Google Maps integration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Lugar donde tendrá el camión disponible</h3>
                    <Input 
                      ref={locationInputRef}
                      className="w-full"
                      placeholder="Ingrese ubicación (ciudad, provincia)"
                      {...form.register("origen_provincia")}
                    />
                    {form.formState.errors.origen_provincia && (
                      <p className="text-red-500 text-sm">{form.formState.errors.origen_provincia.message}</p>
                    )}
                    
                    {/* Radio KM slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Radio de búsqueda</Label>
                        <span className="text-sm font-medium">{form.watch("radio_km")} km</span>
                      </div>
                      <Slider
                        min={5}
                        max={500}
                        step={5}
                        defaultValue={[form.watch("radio_km")]}
                        onValueChange={(values) => form.setValue("radio_km", values[0])}
                      />
                    </div>
                  </div>
                  
                  {/* Availability Type */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tipo de disponibilidad</h3>
                    <RadioGroup 
                      value={disponibilidadTipo} 
                      onValueChange={(v) => setDisponibilidadTipo(v as 'permanente' | 'temporal')}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="permanente" id="permanente" />
                        <Label htmlFor="permanente">Tengo flota permanente aquí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="temporal" id="temporal" />
                        <Label htmlFor="temporal">Voy a estar próximo a estas fechas</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {/* Dates */}
                  {disponibilidadTipo === 'temporal' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Fechas de disponibilidad</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Desde</Label>
                          <DatePicker 
                            date={form.getValues('fecha_disponible_desde') ? new Date(form.getValues('fecha_disponible_desde')) : undefined}
                            onChange={(date) => form.setValue('fecha_disponible_desde', date ? date.toISOString() : '')}
                          />
                          {form.formState.errors.fecha_disponible_desde && (
                            <p className="text-red-500 text-sm">{form.formState.errors.fecha_disponible_desde.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Hasta</Label>
                          <DatePicker 
                            date={form.getValues('fecha_disponible_hasta') ? new Date(form.getValues('fecha_disponible_hasta')) : undefined}
                            onChange={(date) => form.setValue('fecha_disponible_hasta', date ? date.toISOString() : '')}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <Button 
                    type="submit"
                    disabled={loading || selectedTruckIds.length === 0}
                    className="w-full md:w-auto"
                  >
                    Publicar disponibilidad
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PublicarCamion;
