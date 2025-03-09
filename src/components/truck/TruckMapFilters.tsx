
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Truck, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { TruckFilters } from "@/types/truck";

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

interface TruckMapFiltersProps {
  onFilterChange: (filters: TruckFilters) => void;
}

const TruckMapFilters = ({ onFilterChange }: TruckMapFiltersProps) => {
  const [radioKm, setRadioKm] = useState<number>(50);
  const [refrigerado, setRefrigerado] = useState<boolean>(false);
  
  const resetFilters = () => {
    onFilterChange({
      provinciaOrigen: undefined,
      provinciaDestino: undefined,
      tipoCamion: undefined,
      fecha: undefined,
      radioKm: undefined,
      refrigerado: undefined
    });
    setRadioKm(50);
    setRefrigerado(false);
  };

  return (
    <div className="space-y-6 h-full">
      <CardHeader className="px-0">
        <CardTitle>Filtros de búsqueda</CardTitle>
        <CardDescription>
          Filtra los camiones según tus preferencias
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
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha disponible
            </Label>
            <DatePicker 
              onChange={(date) => onFilterChange({ fecha: date?.toISOString() })}
            />
          </div>
          <div className="space-y-3">
            <Label>Radio de acción (km)</Label>
            <Slider
              min={0}
              max={500}
              step={10}
              value={[radioKm]}
              onValueChange={(values) => {
                setRadioKm(values[0]);
                onFilterChange({ radioKm: values[0] });
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0km</span>
              <span>{radioKm}km</span>
              <span>500km</span>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="refrigerado" 
              checked={refrigerado}
              onCheckedChange={(checked) => {
                const isChecked = checked === true;
                setRefrigerado(isChecked);
                onFilterChange({ refrigerado: isChecked });
              }} 
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="refrigerado" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Refrigerado
              </Label>
              <p className="text-sm text-muted-foreground">
                Solo camiones con equipo de frío
              </p>
            </div>
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

export default TruckMapFilters;
