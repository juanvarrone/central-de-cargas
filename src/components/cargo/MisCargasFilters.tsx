
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface MisCargasFilters {
  ordenar: "fecha_desc" | "fecha_asc" | "estado";
  localidad: string;
  estado: string;
}

interface MisCargasFiltersProps {
  filters: MisCargasFilters;
  onFiltersChange: (filters: MisCargasFilters) => void;
}

const MisCargasFilters = ({ filters, onFiltersChange }: MisCargasFiltersProps) => {
  const [tempFilters, setTempFilters] = useState<MisCargasFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters: MisCargasFilters = {
      ordenar: "fecha_desc",
      localidad: "",
      estado: ""
    };
    setTempFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = tempFilters.localidad || tempFilters.estado || tempFilters.ordenar !== "fecha_desc";

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="ordenar">Ordenar por</Label>
            <Select 
              value={tempFilters.ordenar} 
              onValueChange={(value: MisCargasFilters["ordenar"]) => 
                setTempFilters(prev => ({ ...prev, ordenar: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fecha_desc">Fecha (más reciente)</SelectItem>
                <SelectItem value="fecha_asc">Fecha (más antigua)</SelectItem>
                <SelectItem value="estado">Estado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="localidad">Filtrar por localidad</Label>
            <Input
              id="localidad"
              placeholder="Ej: Buenos Aires, Córdoba..."
              value={tempFilters.localidad}
              onChange={(e) => setTempFilters(prev => ({ ...prev, localidad: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select 
              value={tempFilters.estado || "todos"} 
              onValueChange={(value) => 
                setTempFilters(prev => ({ ...prev, estado: value === "todos" ? "" : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="asignada">Asignada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} className="flex-1">
              Aplicar
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <span className="text-sm text-muted-foreground">Filtros activos:</span>
            {tempFilters.localidad && (
              <Badge variant="secondary">
                Localidad: {tempFilters.localidad}
              </Badge>
            )}
            {tempFilters.estado && (
              <Badge variant="secondary">
                Estado: {tempFilters.estado}
              </Badge>
            )}
            {tempFilters.ordenar !== "fecha_desc" && (
              <Badge variant="secondary">
                Orden: {tempFilters.ordenar === "fecha_asc" ? "Fecha ascendente" : "Estado"}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MisCargasFilters;
