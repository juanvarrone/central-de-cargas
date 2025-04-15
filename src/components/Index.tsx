
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Truck, Search, MapPin, Map, TruckIcon, PackageSearch } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { 
    canPublishCarga, 
    canPublishCamion,
    userType,
    isAdmin,
    isLoading
  } = useAuth();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <section className="py-12 mb-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="text-primary">Sistema de Gestión</span> <br />
            <span className="text-secondary">para Transporte de Cargas</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Conectamos cargas con transportistas en toda la región de manera eficiente y segura
          </p>
          <div className="highway-divider max-w-md mx-auto"></div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="highway-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="text-primary" />
              <span>Para Transportistas</span>
            </CardTitle>
            <CardDescription>
              Encuentra cargas disponibles y haz crecer tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={() => handleNavigate("/buscar-cargas")}
                className="w-full h-14 text-lg justify-start px-4"
                variant="default"
              >
                <PackageSearch className="mr-2" size={20} />
                Buscar Cargas
              </Button>
              
              {(canPublishCamion || !isLoading) && (
                <Button
                  onClick={() => handleNavigate("/publicar-camion")}
                  className="w-full h-14 text-lg justify-start px-4"
                  variant="outline"
                  disabled={!canPublishCamion && userType !== null}
                >
                  <TruckIcon className="mr-2" size={20} />
                  {canPublishCamion 
                    ? "Publicar Disponibilidad" 
                    : userType === "dador" 
                      ? "Solo para transportistas" 
                      : "Publicar Disponibilidad"
                  }
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="highway-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageSearch className="text-primary" />
              <span>Para Dadores de Carga</span>
            </CardTitle>
            <CardDescription>
              Encuentra transportistas confiables para tus cargas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {(canPublishCarga || !isLoading) && (
                <Button
                  onClick={() => handleNavigate("/publicar-carga")}
                  className="w-full h-14 text-lg justify-start px-4"
                  variant="default"
                  disabled={!canPublishCarga && userType !== null}
                >
                  <PackageSearch className="mr-2" size={20} />
                  {canPublishCarga 
                    ? "Publicar Carga" 
                    : userType === "camionero" 
                      ? "Solo para dadores" 
                      : "Publicar Carga"
                  }
                </Button>
              )}
              
              <Button
                onClick={() => handleNavigate("/buscar-camiones")}
                className="w-full h-14 text-lg justify-start px-4"
                variant="outline"
              >
                <TruckIcon className="mr-2" size={20} />
                Buscar Camiones
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Button 
          onClick={() => handleNavigate("/mapa-cargas")} 
          variant="outline" 
          size="lg"
          className="bg-white"
        >
          <Map className="mr-2" size={18} />
          Ver Mapa de Cargas
        </Button>
      </div>
      
      {isAdmin && (
        <div className="mt-8 text-center">
          <div className="inline-block px-4 py-2 bg-amber-100 border border-amber-300 rounded-md">
            <p className="text-amber-800 font-medium">
              Estás logueado como administrador - Tienes acceso a todas las funciones
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Index;
