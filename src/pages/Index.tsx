
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Package, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            TransportAR
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            La plataforma que conecta oferentes y transportistas de carga en toda Argentina
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Package className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Publica tu Carga</h2>
              <p className="text-neutral-600 mb-4">
                Especifica los detalles de tu carga y encuentra el transporte adecuado
              </p>
              <Link to="/publicar">
                <Button className="w-full">Publicar Carga</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Truck className="w-12 h-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Encuentra Cargas</h2>
              <p className="text-neutral-600 mb-4">
                Busca oportunidades de transporte en toda Argentina
              </p>
              <Link to="/cargas">
                <Button className="w-full" variant="outline">Ver Cargas Disponibles</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <MapPin className="w-12 h-12 text-red-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Mapa de Cargas</h2>
              <p className="text-neutral-600 mb-4">
                Visualiza las cargas disponibles en el mapa interactivo
              </p>
              <Link to="/mapa">
                <Button className="w-full" variant="secondary">Ver Mapa</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Para Oferentes de Carga</h3>
              <ul className="list-disc pl-5 space-y-2 text-neutral-600">
                <li>Publica los detalles de tu carga</li>
                <li>Especifica fechas y condiciones</li>
                <li>Propone una tarifa inicial</li>
                <li>Negocia con transportistas interesados</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Para Transportistas</h3>
              <ul className="list-disc pl-5 space-y-2 text-neutral-600">
                <li>Busca cargas disponibles</li>
                <li>Filtra por origen y destino</li>
                <li>Visualiza en el mapa interactivo</li>
                <li>Negocia tarifas directamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
