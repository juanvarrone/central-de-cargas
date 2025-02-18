import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Sistema de Gestión de Cargas</CardTitle>
            <CardDescription className="text-center">
              Plataforma para la publicación y búsqueda de cargas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleNavigate("/publicar-carga")}
                className="w-full h-16 text-lg"
              >
                Publicar Carga
              </Button>
              <Button
                onClick={() => handleNavigate("/listado-cargas")}
                className="w-full h-16 text-lg"
                variant="outline"
              >
                Buscar Cargas
              </Button>
              <Button
                onClick={() => handleNavigate("/mapa-cargas")}
                className="w-full h-16 text-lg"
                variant="outline"
              >
                Ver Mapa de Cargas
              </Button>
              <Button
                onClick={() => handleNavigate("/configurar-alertas")}
                className="w-full h-16 text-lg"
                variant="outline"
              >
                Configurar Alertas
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Versión 1.0.0</p>
          {/* Aquí podemos agregar en el futuro un componente que verifique actualizaciones */}
        </div>
      </div>
    </div>
  );
};

export default Index;
