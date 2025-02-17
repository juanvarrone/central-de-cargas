
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface CargoLocationFieldsProps {
  form: UseFormReturn<any>;
  onOrigenChange: (value: string) => void;
  onDestinoChange: (value: string) => void;
}

const CargoLocationFields = ({
  form,
  onOrigenChange,
  onDestinoChange,
}: CargoLocationFieldsProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="origen"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Origen</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ciudad de origen" 
                {...field} 
                onChange={(e) => {
                  field.onChange(e);
                  onOrigenChange(e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="destino"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Destino</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ciudad de destino" 
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  onDestinoChange(e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CargoLocationFields;
