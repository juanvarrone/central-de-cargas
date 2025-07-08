
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

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
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
        <div className="md:col-span-1">
          <FormField
            control={form.control}
            name="cantidadCargas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="999" 
                    className="w-full"
                    {...field} 
                    onChange={e => field.onChange(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 999))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <TarifaFields form={form} distanciaKm={distanciaKm} />
    </>
  );
};

export default CargoDetailsFields;
