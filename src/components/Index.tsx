
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Truck, Search, MapPin, Map, TruckIcon, PackageSearch, FileText, ClipboardList } from "lucide-react";
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

  // Admin can see everything
  if (isAdmin) {
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
                
                <Button
                  onClick={() => handleNavigate("/publicar-camion")}
                  className="w-full h-14 text-lg justify-start px-4"
                  variant="outline"
                >
                  <TruckIcon className="mr-2" size={20} />
                  Publicar Disponibilidad
                </Button>
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
                <Button
                  onClick={() => handleNavigate("/publicar-carga")}
                  className="w-full h-14 text-lg justify-start px-4"
                  variant="default"
                >
                  <PackageSearch className="mr-2" size={20} />
                  Publicar Carga
                </Button>
                
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
        
        <div className="mt-8 text-center">
          <div className="inline-block px-4 py-2 bg-amber-100 border border-amber-300 rounded-md">
            <p className="text-amber-800 font-medium">
              Estás logueado como administrador - Tienes acceso a todas las funciones
            </p>
          </div>
        </div>
      </>
    );
  }

  // Transportista view
  if (userType === "camionero") {
    return (
      <>
        <section className="py-12 mb-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <Logo size="large" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              <span className="text-primary">Portal Transportista</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Encuentra cargas y gestiona tu flota de manera eficiente
            </p>
            <div className="highway-divider max-w-md mx-auto"></div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="highway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageSearch className="text-primary" />
                <span>Buscar Cargas</span>
              </CardTitle>
              <CardDescription>
                Encuentra las mejores oportunidades de carga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/buscar-cargas")}
                className="w-full h-14 text-lg"
                variant="default"
              >
                <PackageSearch className="mr-2" size={20} />
                Buscar Cargas
              </Button>
            </CardContent>
          </Card>

          <Card className="highway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TruckIcon className="text-primary" />
                <span>Publicar Disponibilidad</span>
              </CardTitle>
              <CardDescription>
                Anuncia la disponibilidad de tus camiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/publicar-camion")}
                className="w-full h-14 text-lg"
                variant="default"
              >
                <TruckIcon className="mr-2" size={20} />
                Publicar Disponibilidad
              </Button>
            </CardContent>
          </Card>

          <Card className="highway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="text-primary" />
                <span>Mis Camiones</span>
              </CardTitle>
              <CardDescription>
                Gestiona tu flota de vehículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/mis-camiones")}
                className="w-full h-14 text-lg"
                variant="outline"
              >
                <Truck className="mr-2" size={20} />
                Mis Camiones
              </Button>
            </CardContent>
          </Card>

          <Card className="highway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="text-primary" />
                <span>Mis Postulaciones</span>
              </CardTitle>
              <CardDescription>
                Revisa el estado de tus postulaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/mis-postulaciones")}
                className="w-full h-14 text-lg"
                variant="outline"
              >
                <ClipboardList className="mr-2" size={20} />
                Mis Postulaciones
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Dador de carga view
  if (userType === "dador") {
    return (
      <>
        <section className="py-12 mb-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <Logo size="large" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              <span className="text-primary">Portal Dador de Carga</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Encuentra transportistas confiables para tus cargas
            </p>
            <div className="highway-divider max-w-md mx-auto"></div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="highway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageSearch className="text-primary" />
                <span>Publicar Carga</span>
              </CardTitle>
              <CardDescription>
                Publica tus cargas para encontrar transportistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/publicar-carga")}
                className="w-full h-14 text-lg"
                variant="default"
              >
                <PackageSearch className="mr-2" size={20} />
                Publicar Carga
              </Button>
            </CardContent>
          </Card>

          <Card className="highway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TruckIcon className="text-primary" />
                <span>Buscar Camiones</span>
              </CardTitle>
              <CardDescription>
                Encuentra camiones disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/buscar-camiones")}
                className="w-full h-14 text-lg"
                variant="default"
              >
                <TruckIcon className="mr-2" size={20} />
                Buscar Camiones
              </Button>
            </CardContent>
          </Card>

          <Card className="highway-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="text-primary" />
                <span>Mis Cargas</span>
              </CardTitle>
              <CardDescription>
                Gestiona tus cargas publicadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/mis-cargas")}
                className="w-full h-14 text-lg"
                variant="outline"
              >
                <FileText className="mr-2" size={20} />
                Mis Cargas
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Default view for non-authenticated users or users without a type
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
    </>
  );
};

export default Index;
