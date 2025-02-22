
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface CargoDetailsFieldsProps {
  form: UseFormReturn<any>;
}

const CargoDetailsFields = ({ form }: CargoDetailsFieldsProps) => {
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="fechaCarga"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Carga</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
      </div>

      <div className="grid md:grid-cols-2 gap-6">
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
      </div>

      <FormField
        control={form.control}
        name="tarifa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tarifa Propuesta (ARS)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="0.00" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default CargoDetailsFields;
