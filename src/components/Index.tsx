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
        <section className="py-1 mb-1">
          <div className="text-center max-w-3xl mx-auto">
         {/*  <div className="flex justify-center mb-6">
              <Logo size="large" />
          </div> */}
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              <span className="text-primary">Sistema de Gestión</span> <br />
              <span className="text-secondary">de Transporte Argentino</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Conectamos cargas con transportistas en toda la Argentina de manera eficiente y segura
            </p>
            <div className="highway-divider max-w-md mx-auto"></div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="relative overflow-hidden">
              <div className="modern-icon-container mb-4">
                <div className="modern-icon bg-gradient-to-br from-blue-400 to-blue-600">
                  <Truck className="text-white" size={32} />
                </div>
              </div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <span>Para Transportistas</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Encuentra cargas disponibles y haz crecer tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => handleNavigate("/buscar-cargas")}
                  className="modern-button modern-button-primary h-14 text-lg justify-start px-6"
                  variant="default"
                >
                  <div className="button-icon-wrapper">
                    <PackageSearch size={20} />
                  </div>
                  Buscar Cargas
                </Button>
                
                <Button
                  onClick={() => handleNavigate("/publicar-camion")}
                  className="modern-button modern-button-secondary h-14 text-lg justify-start px-6"
                  variant="outline"
                >
                  <div className="button-icon-wrapper">
                    <TruckIcon size={20} />
                  </div>
                  Publicar Disponibilidad
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="relative overflow-hidden">
              <div className="modern-icon-container mb-4">
                <div className="modern-icon bg-gradient-to-br from-orange-400 to-orange-600">
                  <PackageSearch className="text-white" size={32} />
                </div>
              </div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <span>Para Dadores de Carga</span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Encuentra transportistas confiables para tus cargas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => handleNavigate("/publicar-carga")}
                  className="modern-button modern-button-primary h-14 text-lg justify-start px-6"
                  variant="default"
                >
                  <div className="button-icon-wrapper">
                    <PackageSearch size={20} />
                  </div>
                  Publicar Carga
                </Button>
                
                <Button
                  onClick={() => handleNavigate("/buscar-camiones")}
                  className="modern-button modern-button-secondary h-14 text-lg justify-start px-6"
                  variant="outline"
                >
                  <div className="button-icon-wrapper">
                    <TruckIcon size={20} />
                  </div>
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
            className="modern-button modern-button-outline bg-white hover:bg-gray-50"
          >
            <div className="button-icon-wrapper">
              <Map size={18} />
            </div>
            Ver Mapa de Cargas
          </Button>
        </div>
        
        <div className="mt-8 text-center">
          <div className="modern-badge bg-amber-50 border border-amber-200 text-amber-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <p className="font-medium">
                Estás logueado como administrador - Tienes acceso a todas las funciones
              </p>
            </div>
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
             {/*<div className="flex justify-center mb-6">
              <Logo size="large" />
            </div> */}
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              <span className="text-primary">Portal Transportista</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Encuentra cargas en toda Argentina y gestiona tu flota de manera eficiente
            </p>
            <div className="highway-divider max-w-md mx-auto"></div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="modern-icon-container mb-4">
                <div className="modern-icon bg-gradient-to-br from-green-400 to-green-600">
                  <PackageSearch className="text-white" size={32} />
                </div>
              </div>
              <CardTitle className="text-xl">Buscar Cargas</CardTitle>
              <CardDescription className="text-gray-600">
                Encuentra las mejores oportunidades de carga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/buscar-cargas")}
                className="modern-button modern-button-primary w-full h-14 text-lg"
                variant="default"
              >
                <div className="button-icon-wrapper">
                  <PackageSearch size={20} />
                </div>
                Buscar Cargas
              </Button>
            </CardContent>
          </Card>

          <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="modern-icon-container mb-4">
                <div className="modern-icon bg-gradient-to-br from-blue-400 to-blue-600">
                  <TruckIcon className="text-white" size={32} />
                </div>
              </div>
              <CardTitle className="text-xl">Publicar Disponibilidad</CardTitle>
              <CardDescription className="text-gray-600">
                Anuncia la disponibilidad de tus camiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/publicar-camion")}
                className="modern-button modern-button-primary w-full h-14 text-lg"
                variant="default"
              >
                <div className="button-icon-wrapper">
                  <TruckIcon size={20} />
                </div>
                Publicar Disponibilidad
              </Button>
            </CardContent>
          </Card>

          <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="modern-icon-container mb-4">
                <div className="modern-icon bg-gradient-to-br from-purple-400 to-purple-600">
                  <Truck className="text-white" size={32} />
                </div>
              </div>
              <CardTitle className="text-xl">Mis Camiones</CardTitle>
              <CardDescription className="text-gray-600">
                Gestiona tu flota de vehículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/mis-camiones")}
                className="modern-button modern-button-secondary w-full h-14 text-lg"
                variant="outline"
              >
                <div className="button-icon-wrapper">
                  <Truck size={20} />
                </div>
                Mis Camiones
              </Button>
            </CardContent>
          </Card>

          <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="modern-icon-container mb-4">
                <div className="modern-icon bg-gradient-to-br from-indigo-400 to-indigo-600">
                  <ClipboardList className="text-white" size={32} />
                </div>
              </div>
              <CardTitle className="text-xl">Mis Postulaciones</CardTitle>
              <CardDescription className="text-gray-600">
                Revisa el estado de tus postulaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/mis-postulaciones")}
                className="modern-button modern-button-secondary w-full h-14 text-lg"
                variant="outline"
              >
                <div className="button-icon-wrapper">
                  <ClipboardList size={20} />
                </div>
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
             {/*<div className="flex justify-center mb-6">
              <Logo size="large" />
            </div> */}
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              <span className="text-primary">Portal Dador de Carga</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Encuentra transportistas confiables en toda Argentina para tus cargas
            </p>
            <div className="highway-divider max-w-md mx-auto"></div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="modern-icon-container mb-4">
                <div className="modern-icon bg-gradient-to-br from-orange-400 to-orange-600">
                  <PackageSearch className="text-white" size={32} />
                </div>
              </div>
              <CardTitle className="text-xl">Publicar Carga</CardTitle>
              <CardDescription className="text-gray-600">
                Publica tus cargas para encontrar transportistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/publicar-carga")}
                className="modern-button modern-button-primary w-full h-14 text-lg"
                variant="default"
              >
                <div className="button-icon-wrapper">
                  <PackageSearch size={20} />
                </div>
                Publicar Carga
              </Button>
            </CardContent>
          </Card>

          <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="modern-icon-container mb-4">
                <div className="modern-icon bg-gradient-to-br from-blue-400 to-blue-600">
                  <TruckIcon className="text-white" size={32} />
                </div>
              </div>
              <CardTitle className="text-xl">Buscar Camiones</CardTitle>
              <CardDescription className="text-gray-600">
                Encuentra camiones disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/buscar-camiones")}
                className="modern-button modern-button-primary w-full h-14 text-lg"
                variant="default"
              >
                <div className="button-icon-wrapper">
                  <TruckIcon size={20} />
                </div>
                Buscar Camiones
              </Button>
            </CardContent>
          </Card>

          <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <div className="modern-icon-container mb-4">
                <div className="modern-icon bg-gradient-to-br from-green-400 to-green-600">
                  <FileText className="text-white" size={32} />
                </div>
              </div>
              <CardTitle className="text-xl">Mis Cargas</CardTitle>
              <CardDescription className="text-gray-600">
                Gestiona tus cargas publicadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleNavigate("/mis-cargas")}
                className="modern-button modern-button-secondary w-full h-14 text-lg"
                variant="outline"
              >
                <div className="button-icon-wrapper">
                  <FileText size={20} />
                </div>
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
           {/* <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div> */}
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            <span className="text-primary">Sistema de Gestión</span> <br />
            <span className="text-secondary">de Transporte Argentino</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Conectamos cargas con transportistas en toda la Argentina de manera eficiente y segura
          </p>
          <div className="highway-divider max-w-md mx-auto"></div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader>
            <div className="modern-icon-container mb-4">
              <div className="modern-icon bg-gradient-to-br from-blue-400 to-blue-600">
                <Truck className="text-white" size={32} />
              </div>
            </div>
            <CardTitle className="text-xl">Para Transportistas</CardTitle>
            <CardDescription className="text-gray-600">
              Encuentra cargas disponibles y haz crecer tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={() => handleNavigate("/buscar-cargas")}
                className="modern-button modern-button-primary h-14 text-lg justify-start px-6"
                variant="default"
              >
                <div className="button-icon-wrapper">
                  <PackageSearch size={20} />
                </div>
                Buscar Cargas
              </Button>
              
              <Button
                onClick={() => handleNavigate("/publicar-camion")}
                className="modern-button modern-button-secondary h-14 text-lg justify-start px-6"
                variant="outline"
                disabled={!canPublishCamion && userType !== null}
              >
                <div className="button-icon-wrapper">
                  <TruckIcon size={20} />
                </div>
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

        <Card className="modern-card group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader>
            <div className="modern-icon-container mb-4">
              <div className="modern-icon bg-gradient-to-br from-orange-400 to-orange-600">
                <PackageSearch className="text-white" size={32} />
              </div>
            </div>
            <CardTitle className="text-xl">Para Dadores de Carga</CardTitle>
            <CardDescription className="text-gray-600">
              Encuentra transportistas confiables para tus cargas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={() => handleNavigate("/publicar-carga")}
                className="modern-button modern-button-primary h-14 text-lg justify-start px-6"
                variant="default"
                disabled={!canPublishCarga && userType !== null}
              >
                <div className="button-icon-wrapper">
                  <PackageSearch size={20} />
                </div>
                {canPublishCarga 
                  ? "Publicar Carga" 
                  : userType === "camionero" 
                    ? "Solo para dadores" 
                    : "Publicar Carga"
                }
              </Button>
              
              <Button
                onClick={() => handleNavigate("/buscar-camiones")}
                className="modern-button modern-button-secondary h-14 text-lg justify-start px-6"
                variant="outline"
              >
                <div className="button-icon-wrapper">
                  <TruckIcon size={20} />
                </div>
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
          className="modern-button modern-button-outline bg-white hover:bg-gray-50"
        >
          <div className="button-icon-wrapper">
            <Map size={18} />
          </div>
          Ver Mapa de Cargas
        </Button>
      </div>
    </>
  );
};

export default Index;
