
import React from "react";
import { InfoWindow } from "@react-google-maps/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Calendar, MapPin, Phone } from "lucide-react";
import { SelectedTruck } from "./useTruckMap";

interface TruckInfoWindowProps {
  selectedTruck: SelectedTruck | null;
  onClose: () => void;
}

const TruckInfoWindow = ({ selectedTruck, onClose }: TruckInfoWindowProps) => {
  if (!selectedTruck) return null;

  const { truck, tipo } = selectedTruck;
  
  const position = tipo === "origen" 
    ? { lat: Number(truck.origen_lat), lng: Number(truck.origen_lng) }
    : { lat: Number(truck.destino_lat), lng: Number(truck.destino_lng) };

  const formatLocation = (ciudad?: string, provincia?: string) => {
    const parts = [];
    if (ciudad) parts.push(ciudad);
    if (provincia) parts.push(provincia);
    return parts.join(", ") || "Sin detalles";
  };

  return (
    <InfoWindow
      position={position}
      onCloseClick={onClose}
    >
      <div className="p-2 max-w-xs">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2 border-b pb-2">
            <Truck className="h-4 w-4 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">{truck.tipo_camion}</h3>
              <p className="text-xs text-gray-600">{truck.capacidad}</p>
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
              <div className="min-w-0">
                <p className="font-medium text-xs">Origen: {formatLocation(truck.origen_ciudad, truck.origen_provincia)}</p>
                {tipo === "destino" && (
                  <p className="text-xs text-gray-500">También disponible en destino</p>
                )}
              </div>
            </div>
            
            {truck.destino_lat && truck.destino_lng && (
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
                <div className="min-w-0">
                  <p className="font-medium text-xs">Destino: {formatLocation(truck.destino_ciudad, truck.destino_provincia)}</p>
                  {tipo === "origen" && (
                    <p className="text-xs text-gray-500">También disponible en origen</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2 border-t pt-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-500" />
              <span className="text-xs">
                Desde: {new Date(truck.fecha_disponible_desde).toLocaleDateString()}
              </span>
            </div>
            
            {truck.fecha_disponible_hasta && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span className="text-xs">
                  Hasta: {new Date(truck.fecha_disponible_hasta).toLocaleDateString()}
                </span>
              </div>
            )}

            {truck.es_permanente && (
              <Badge variant="outline" className="text-xs">
                Disponibilidad permanente
              </Badge>
            )}

            {truck.refrigerado && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                Refrigerado
              </Badge>
            )}
          </div>

          {/* Contact Button */}
          <div className="border-t pt-2">
            <Button size="sm" className="w-full text-xs">
              <Phone className="h-3 w-3 mr-1" />
              Contactar
            </Button>
          </div>
        </div>
      </div>
    </InfoWindow>
  );
};

export default TruckInfoWindow;
