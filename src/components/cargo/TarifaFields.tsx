
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";

interface TarifaFieldsProps {
  form: UseFormReturn<any>;
  distanciaKm?: number;
}

const TarifaFields = ({ form, distanciaKm }: TarifaFieldsProps) => {
  const [tarifaPorKm, setTarifaPorKm] = useState<number | null>(null);
  
  const tipoTarifa = form.watch("tipo_tarifa");
  const tarifa = form.watch("tarifa");

  // Calcular tarifa por kilómetro cuando es por viaje
  useEffect(() => {
    if (tipoTarifa === "por_viaje" && tarifa && distanciaKm && distanciaKm > 0) {
      // Eliminar todo excepto números para obtener el valor real
      const tarifaNumero = parseFloat(tarifa.replace(/\D/g, ""));
      if (!isNaN(tarifaNumero) && tarifaNumero > 0) {
        // Cálculo correcto: tarifa / kilómetros
        const tarifaCalculada = tarifaNumero / distanciaKm;
        setTarifaPorKm(tarifaCalculada);
      } else {
        setTarifaPorKm(null);
      }
    } else {
      setTarifaPorKm(null);
    }
  }, [tipoTarifa, tarifa, distanciaKm]);

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, "");
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(number));
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="tipo_tarifa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Tarifa</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de tarifa" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="por_viaje">Por Viaje Completo</SelectItem>
                <SelectItem value="por_tonelada">Por Tonelada</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tarifa"
        render={({ field: { onChange, ...field } }) => (
          <FormItem>
            <FormLabel>
              {tipoTarifa === "por_tonelada" ? "Tarifa por Tonelada" : "Tarifa del Viaje"}
            </FormLabel>
            <FormControl>
              <Input 
                type="text"
                placeholder="$ 0"
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  onChange(value);
                  e.target.value = formatCurrency(value);
                }}
                onBlur={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  e.target.value = formatCurrency(value);
                }}
              />
            </FormControl>
            <FormMessage />
            
            {tarifaPorKm && (
              <div className="text-sm text-muted-foreground mt-2 p-2 bg-blue-50 rounded">
                <strong>Tarifa por km:</strong> {formatCurrency(tarifaPorKm.toFixed(2))}
                {distanciaKm && (
                  <span className="ml-2">
                    (Distancia: {distanciaKm.toFixed(1)} km)
                  </span>
                )}
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};

export default TarifaFields;
