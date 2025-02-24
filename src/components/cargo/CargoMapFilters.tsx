
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";

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
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtros de búsqueda</SheetTitle>
          <SheetDescription>
            Filtra las cargas según tus preferencias
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Provincia de origen</Label>
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
            <Label>Provincia de destino</Label>
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
            <Label>Tipo de camión</Label>
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
      </SheetContent>
    </Sheet>
  );
};

export default CargoMapFilters;
