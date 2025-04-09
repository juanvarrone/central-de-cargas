
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto mt-8">
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
              onClick={() => handleNavigate("/buscar-cargas")}
              className="w-full h-16 text-lg"
              variant="outline"
            >
              Buscar Cargas
            </Button>
            <Button
              onClick={() => handleNavigate("/publicar-camion")}
              className="w-full h-16 text-lg"
              variant="outline"
            >
              Publicar Camión
            </Button>
            <Button
              onClick={() => handleNavigate("/buscar-camiones")}
              className="w-full h-16 text-lg"
              variant="outline"
            >
              Buscar Camiones
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p className="mb-2">Versión 1.0.0</p>
        <div className="space-x-4">
          <Link 
            to="/terminos-condiciones" 
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Términos y Condiciones
          </Link>
          <span>•</span>
          <Link 
            to="/politicas-privacidad" 
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Políticas de Privacidad
          </Link>
        </div>
        <p className="mt-4 text-xs">
          © {new Date().getFullYear()} Sistema de Gestión de Cargas. Todos los derechos reservados. CUIT: XX-XXXXXXXX-X
        </p>
      </div>
    </>
  );
};

export default Index;
