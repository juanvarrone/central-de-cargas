
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface CargoDateFieldsProps {
  form: UseFormReturn<any>;
}

const CargoDateFields = ({ form }: CargoDateFieldsProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="fecha_carga_desde"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {form.watch("tipo_fecha") === "exacta" ? "Fecha de Carga" : "Fecha Desde"}
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {form.watch("tipo_fecha") === "rango" && (
        <FormField
          control={form.control}
          name="fecha_carga_hasta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha Hasta</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default CargoDateFields;
