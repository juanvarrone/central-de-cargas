
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Truck } from "lucide-react";

const provinciasArgentina = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán"
];

interface CargoMapFiltersProps {
  onFilterChange: (filters: {
    provinciaOrigen?: string;
    provinciaDestino?: string;
    tipoCamion?: string;
  }) => void;
}

const CargoMapFilters = ({ onFilterChange }: CargoMapFiltersProps) => {
  const resetFilters = () => {
    onFilterChange({
      provinciaOrigen: undefined,
      provinciaDestino: undefined,
      tipoCamion: undefined
    });
  };

  return (
    <div className="h-full">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grow-0 min-w-40">
          <Label className="flex items-center gap-1 mb-1 text-sm">
            <MapPin className="text-green-500 h-3 w-3" />
            Origen
          </Label>
          <Select
            onValueChange={(value) =>
              onFilterChange({ provinciaOrigen: value })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Provincia" />
            </SelectTrigger>
            <SelectContent>
              {provinciasArgentina.map((provincia) => (
                <SelectItem key={provincia} value={provincia}>
                  {provincia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grow-0 min-w-40">
          <Label className="flex items-center gap-1 mb-1 text-sm">
            <MapPin className="text-red-500 h-3 w-3" />
            Destino
          </Label>
          <Select
            onValueChange={(value) =>
              onFilterChange({ provinciaDestino: value })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Provincia" />
            </SelectTrigger>
            <SelectContent>
              {provinciasArgentina.map((provincia) => (
                <SelectItem key={provincia} value={provincia}>
                  {provincia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grow-0 min-w-40">
          <Label className="flex items-center gap-1 mb-1 text-sm">
            <Truck className="h-3 w-3" />
            Camión
          </Label>
          <Select
            onValueChange={(value) =>
              onFilterChange({ tipoCamion: value })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semi">Semi</SelectItem>
              <SelectItem value="acoplado">Acoplado</SelectItem>
              <SelectItem value="chasis">Chasis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="ml-auto self-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetFilters}
            className="h-9"
          >
            Limpiar filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CargoMapFilters;
