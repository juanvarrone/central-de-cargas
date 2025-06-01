
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import TarifaFields from "@/components/cargo/TarifaFields";

interface CargoDetailsFieldsProps {
  form: UseFormReturn<any>;
  distanciaKm?: number;
}

const CargoDetailsFields = ({ form, distanciaKm }: CargoDetailsFieldsProps) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="cantidadCargas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad de Cargas</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  {...field} 
                  onChange={e => field.onChange(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tipoCarga"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Carga</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Palletizado, Granel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="tipoCamion"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Camión</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Semi, Chasis" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <TarifaFields form={form} distanciaKm={distanciaKm} />
    </>
  );
};

export default CargoDetailsFields;
