
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, MapPin, Calendar, Truck } from "lucide-react";

const ListadoCargas = () => {
  // Datos de ejemplo - esto se reemplazaría con datos reales de la base de datos
  const cargas = [
    {
      id: 1,
      origen: "Buenos Aires",
      destino: "Córdoba",
      fechaCarga: "2024-03-20",
      tipoCarga: "Palletizado",
      tipoCamion: "Semi",
      tarifa: 150000,
      estado: "Disponible"
    },
    {
      id: 2,
      origen: "Rosario",
      destino: "Mendoza",
      fechaCarga: "2024-03-22",
      tipoCarga: "Granel",
      tipoCamion: "Chasis",
      tarifa: 120000,
      estado: "Disponible"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Cargas Disponibles</h1>
        
        <div className="grid gap-6">
          {cargas.map((carga) => (
            <Card key={carga.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-neutral-500">Origen</p>
                        <p className="font-medium">{carga.origen}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm text-neutral-500">Destino</p>
                        <p className="font-medium">{carga.destino}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-neutral-600" />
                      <div>
                        <p className="text-sm text-neutral-500">Fecha de Carga</p>
                        <p className="font-medium">{carga.fechaCarga}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-neutral-600" />
                      <div>
                        <p className="text-sm text-neutral-500">Tipo de Carga</p>
                        <p className="font-medium">{carga.tipoCarga}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-5 h-5 text-neutral-600" />
                      <div>
                        <p className="text-sm text-neutral-500">Tipo de Camión</p>
                        <p className="font-medium">{carga.tipoCamion}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Tarifa Propuesta</p>
                      <p className="font-medium">
                        ARS {carga.tarifa.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button>Ver Detalles</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListadoCargas;
