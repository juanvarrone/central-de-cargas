
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Truck, Search, MapPin, Map, TruckIcon, PackageSearch } from "lucide-react";
import Logo from "@/components/Logo";

const Index = () => {
  const navigate = useNavigate();

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
    </>
  );
};

export default Index;
