
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface TruckCardProps {
  truck: {
    id: string;
    tipo_camion: string;
    capacidad: string;
    refrigerado: boolean;
    patente_chasis: string;
    patente_acoplado?: string | null;
    foto_chasis?: string | null;
    foto_acoplado?: string | null;
    foto_chasis_thumbnail?: string | null;
  };
  onSelect?: (truckId: string) => void;
  isSelected?: boolean;
}

const TruckCard = ({ truck, onSelect, isSelected }: TruckCardProps) => {
  const [imageOpen, setImageOpen] = useState(false);
  
  return (
    <>
      <Card 
        className={`cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''}`}
        onClick={() => onSelect && onSelect(truck.id)}
      >
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {(truck.foto_chasis_thumbnail || truck.foto_chasis) ? (
              <div className="w-full md:w-1/3">
                <img 
                  src={truck.foto_chasis_thumbnail || truck.foto_chasis} 
                  alt={`Camión ${truck.patente_chasis}`} 
                  className="w-full h-32 object-cover rounded-md cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageOpen(true);
                  }}
                />
              </div>
            ) : (
              <div className="w-full md:w-1/3 flex justify-center items-center h-32 bg-gray-100 rounded-md">
                <Truck className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            <div className="w-full md:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg capitalize">
                      {truck.tipo_camion} - {truck.capacidad} ton.
                    </h3>
                    <p className="text-muted-foreground">
                      Patente: {truck.patente_chasis}
                      {truck.patente_acoplado && ` / ${truck.patente_acoplado}`}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                {truck.refrigerado && (
                  <Badge variant="outline" className="bg-blue-50">Refrigerado</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {truck.foto_chasis && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="sm:max-w-xl">
            <img 
              src={truck.foto_chasis} 
              alt={`Camión ${truck.patente_chasis}`} 
              className="w-full object-contain max-h-[80vh] rounded-md"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TruckCard;
