
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-6 h-full">
      <CardHeader className="px-0">
        <CardTitle>Filtros de búsqueda</CardTitle>
        <CardDescription>
          Filtra las cargas según tus preferencias
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="text-green-500 h-4 w-4" />
              Provincia de origen
            </Label>
            <Select
              onValueChange={(value) =>
                onFilterChange({ provinciaOrigen: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una provincia" />
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
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="text-red-500 h-4 w-4" />
              Provincia de destino
            </Label>
            <Select
              onValueChange={(value) =>
                onFilterChange({ provinciaDestino: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una provincia" />
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
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Tipo de camión
            </Label>
            <Select
              onValueChange={(value) =>
                onFilterChange({ tipoCamion: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo de camión" />
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
      <div className="mt-auto pt-4 border-t">
        <Button 
          variant="outline" 
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
