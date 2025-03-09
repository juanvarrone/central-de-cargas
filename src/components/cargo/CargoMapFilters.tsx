
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Truck } from "lucide-react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <CardHeader className="px-0 pb-2">
        <CardTitle className="text-lg">Filtros de búsqueda</CardTitle>
        <CardDescription>
          Filtra las cargas según tus preferencias
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="flex items-center gap-2 mb-1">
              <MapPin className="text-green-500 h-4 w-4" />
              Origen
            </Label>
            <Select
              onValueChange={(value) =>
                onFilterChange({ provinciaOrigen: value })
              }
            >
              <SelectTrigger>
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
          <div>
            <Label className="flex items-center gap-2 mb-1">
              <MapPin className="text-red-500 h-4 w-4" />
              Destino
            </Label>
            <Select
              onValueChange={(value) =>
                onFilterChange({ provinciaDestino: value })
              }
            >
              <SelectTrigger>
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
          <div>
            <Label className="flex items-center gap-2 mb-1">
              <Truck className="h-4 w-4" />
              Camión
            </Label>
            <Select
              onValueChange={(value) =>
                onFilterChange({ tipoCamion: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semi">Semi</SelectItem>
                <SelectItem value="acoplado">Acoplado</SelectItem>
                <SelectItem value="chasis">Chasis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <div className="pt-2 border-t">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full" 
          onClick={resetFilters}
        >
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
};

export default CargoMapFilters;
