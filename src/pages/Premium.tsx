import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, CreditCard, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Separator } from "@/components/ui/separator";

interface BankInfo {
  bankName: string;
  accountName: string;
  cbu: string;
  alias: string;
}

interface AppModule {
  id: string;
  name: string;
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;
  settings?: {
    bankName?: string;
    accountName?: string;
    cbu?: string;
    alias?: string;
  };
}

const Premium = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bankName: "",
    accountName: "",
    cbu: "",
    alias: "",
  });
  const { profile, isLoading } = useUserProfile();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        console.log("Fetching premium module settings...");
        
        // Fetch the premium module settings - this should be accessible to all users
        const { data, error } = await supabase
          .from("app_modules")
          .select("*")
          .eq("name", "premium_subscription")
          .maybeSingle();

        console.log("Premium module query result:", { data, error });

        if (error) {
          console.error("Error fetching premium settings:", error);
          throw error;
        }

        console.log("Premium module data:", data);
        
        if (data) {
          const moduleData = data as AppModule;
          console.log("Module settings found:", moduleData.settings);
          
          if (moduleData?.settings) {
            setBankInfo({
              bankName: moduleData.settings.bankName || "",
              accountName: moduleData.settings.accountName || "",
              cbu: moduleData.settings.cbu || "",
              alias: moduleData.settings.alias || "",
            });
            console.log("Bank info updated successfully");
          } else {
            console.log("No settings object found in module data");
          }
        } else {
          console.log("No premium module found with name 'premium_subscription'");
        }
      } catch (error) {
        console.error("Error fetching premium settings:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos de pago",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const isUserPremium = profile?.subscription_tier === "premium";

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/")} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al inicio
        </Button>
        <h1 className="text-2xl font-bold">Plan Premium</h1>
      </div>
      
      <div className="max-w-3xl mx-auto grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Beneficios Premium
            </CardTitle>
            <CardDescription>
              Mejora tu experiencia con funciones exclusivas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Publicaciones ilimitadas de carga o disponibilidad</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Postulaciones ilimitadas a cargas disponibles</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Prioridad en los listados de búsqueda</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Mayor cantidad de alertas configurables</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span>Mayor visibilidad para tu perfil</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex-col items-start">
            {isUserPremium ? (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Cuenta Premium activa hasta: {profile?.subscription_ends_at ? 
                  new Date(profile.subscription_ends_at).toLocaleDateString('es-AR') : 
                  'No definido'}
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Ya eres usuario Premium
                </Button>
              </>
            ) : (
              <Button 
                className="w-full" 
                onClick={() => document.getElementById("payment-section")?.scrollIntoView({ behavior: 'smooth' })}
              >
                Actualizar a Premium
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card className={!isUserPremium ? "border-primary" : ""} id="payment-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Información de Pago
            </CardTitle>
            <CardDescription>
              Completa una transferencia bancaria para activar tu cuenta Premium
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-center py-4">Cargando información de pago...</p>
            ) : (
              <>
                <div className="space-y-2 p-4 bg-muted rounded-md">
                  <div>
                    <p className="text-sm font-medium">Banco</p>
                    <p>{bankInfo.bankName || "Por definir"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Titular</p>
                    <p>{bankInfo.accountName || "Por definir"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">CBU</p>
                    <p className="font-mono">{bankInfo.cbu || "Por definir"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Alias</p>
                    <p className="font-mono">{bankInfo.alias || "Por definir"}</p>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Una vez realizada la transferencia, comunícate con nuestro equipo para activar tu cuenta Premium.</p>
                </div>

                <Separator />

                <div className="text-center">
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={`https://wa.me/5491100000000?text=Hola, quiero activar mi cuenta Premium. Mi email es ${profile?.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contactar por WhatsApp
                    </a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Premium;
