
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Truck, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const truckSchema = z.object({
  tipo_camion: z.string().min(1, "El tipo de camión es requerido"),
  capacidad: z.string().min(1, "La capacidad es requerida"),
  refrigerado: z.boolean().default(false),
  patente_chasis: z.string().min(6, "La patente del chasis es requerida"),
  patente_acoplado: z.string().optional(),
});

type TruckFormData = z.infer<typeof truckSchema>;

const AgregarCamion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fotoChassis, setFotoChassis] = useState<File | null>(null);
  const [fotoAcoplado, setFotoAcoplado] = useState<File | null>(null);
  const [fotoChassisPreview, setFotoChassisPreview] = useState<string | null>(null);
  const [fotoAcopladoPreview, setFotoAcopladoPreview] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  const form = useForm<TruckFormData>({
    resolver: zodResolver(truckSchema),
    defaultValues: {
      tipo_camion: "",
      capacidad: "",
      refrigerado: false,
      patente_chasis: "",
      patente_acoplado: "",
    },
  });
  
  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
      } else {
        // Redirect to login if not authenticated
        toast({
          title: "Acceso restringido",
          description: "Debe iniciar sesión para agregar un camión",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    
    checkUser();
    
    // Setup auth state change listener
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
      } else if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate, toast]);
  
  const handleFotoChassisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoChassis(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoChassisPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFotoAcopladoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoAcoplado(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoAcopladoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const clearFotoChassis = () => {
    setFotoChassis(null);
    setFotoChassisPreview(null);
  };
  
  const clearFotoAcoplado = () => {
    setFotoAcoplado(null);
    setFotoAcopladoPreview(null);
  };
  
  const uploadPhoto = async (file: File, filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('truck-photos')
        .upload(filePath, file);
        
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('truck-photos')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error: any) {
      console.error("Error uploading file:", error);
      throw new Error(`Error al subir la foto: ${error.message}`);
    }
  };
  
  const onSubmit = async (data: TruckFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debe iniciar sesión para continuar",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!fotoChassis) {
      toast({
        title: "Error",
        description: "Debe cargar una foto del chasis",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create unique folder for user's truck photos
      const userId = user.id;
      const timestamp = new Date().getTime();
      const basePath = `${userId}/${timestamp}`;
      
      // Upload photos and get URLs
      let fotoChasisUrl = null;
      let fotoAcopladoUrl = null;
      
      if (fotoChassis) {
        const filePath = `${basePath}/chasis_${fotoChassis.name}`;
        fotoChasisUrl = await uploadPhoto(fotoChassis, filePath);
      }
      
      if (fotoAcoplado) {
        const filePath = `${basePath}/acoplado_${fotoAcoplado.name}`;
        fotoAcopladoUrl = await uploadPhoto(fotoAcoplado, filePath);
      }
      
      // Save truck data to database
      const { error } = await supabase
        .from('trucks')
        .insert({
          user_id: userId,
          tipo_camion: data.tipo_camion,
          capacidad: data.capacidad,
          refrigerado: data.refrigerado,
          patente_chasis: data.patente_chasis,
          patente_acoplado: data.patente_acoplado || null,
          foto_chasis: fotoChasisUrl,
          foto_acoplado: fotoAcopladoUrl,
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Éxito",
        description: "Camión agregado correctamente",
      });
      
      // Redirect back to the previous page
      navigate(-1);
    } catch (error: any) {
      console.error("Error adding truck:", error);
      toast({
        title: "Error",
        description: error.message || "Error al agregar el camión",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
        <h1 className="text-2xl font-bold">Agregar Nuevo Camión</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Detalles del camión */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Detalles del Camión</h2>
              <Separator />
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tipo_camion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Camión</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo de camión" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="semi">Semi</SelectItem>
                          <SelectItem value="chasis">Chasis</SelectItem>
                          <SelectItem value="furgon">Furgón</SelectItem>
                          <SelectItem value="balancin">Balancín</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="capacidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidad (toneladas)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="text"
                          placeholder="Ej: 30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="refrigerado"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Refrigerado</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Patentes y fotos */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium">Patentes y Fotografías</h2>
              <Separator />
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="patente_chasis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patente del Chasis</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="Ej: AB123CD"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="patente_acoplado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patente del Acoplado (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="Ej: XY456ZW"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormLabel>Foto del Chasis (obligatoria)</FormLabel>
                  <div className="relative">
                    {fotoChassisPreview ? (
                      <div className="relative rounded-md overflow-hidden">
                        <img 
                          src={fotoChassisPreview} 
                          alt="Vista previa de chasis" 
                          className="w-full h-40 object-cover"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm" 
                          className="absolute top-2 right-2 h-8 w-8 p-0" 
                          onClick={clearFotoChassis}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-md border-gray-300 cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-6 w-6 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Click para subir</span> o arrastre y suelte
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFotoChassisChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <FormLabel>Foto del Acoplado (opcional)</FormLabel>
                  <div className="relative">
                    {fotoAcopladoPreview ? (
                      <div className="relative rounded-md overflow-hidden">
                        <img 
                          src={fotoAcopladoPreview} 
                          alt="Vista previa de acoplado" 
                          className="w-full h-40 object-cover"
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm" 
                          className="absolute top-2 right-2 h-8 w-8 p-0" 
                          onClick={clearFotoAcoplado}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-md border-gray-300 cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-6 w-6 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Click para subir</span> o arrastre y suelte
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFotoAcopladoChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Camión"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AgregarCamion;
