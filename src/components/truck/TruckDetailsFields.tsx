
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface TruckDetailsFieldsProps {
  form: UseFormReturn<any>;
}

const TruckDetailsFields = ({ form }: TruckDetailsFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="tipo_camion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de camión</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de camión" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="semi">Semi</SelectItem>
                  <SelectItem value="acoplado">Acoplado</SelectItem>
                  <SelectItem value="chasis">Chasis</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidad de carga (en toneladas)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej: 30" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="refrigerado"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Refrigerado</FormLabel>
              <FormDescription>
                Marque esta opción si su camión cuenta con sistema de refrigeración
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="radio_km"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Radio de acción (en km a la redonda)</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <Slider
                  min={0}
                  max={500}
                  step={10}
                  defaultValue={[field.value]}
                  onValueChange={(values) => field.onChange(values[0])}
                />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">0 km</span>
                  <span className="text-sm font-medium">{field.value} km</span>
                  <span className="text-sm text-gray-500">500 km</span>
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Esta distancia determina cuántos kilómetros adicionales está dispuesto a desviarse de la ruta
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="observaciones"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observaciones adicionales</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Ej: Equipo con rastreo satelital, chofer con experiencia internacional, etc."
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TruckDetailsFields;
