
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Lo sentimos, la página que buscas no existe
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => window.history.back()} 
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la página anterior
          </Button>
          <Link to="/" className="block">
            <Button className="w-full">
              Ir al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
