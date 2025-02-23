
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";

interface CargoDateTypeFieldProps {
  form: UseFormReturn<any>;
}

const CargoDateTypeField = ({ form }: CargoDateTypeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="tipo_fecha"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de fecha</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exacta" id="exacta" />
                <label htmlFor="exacta">Fecha exacta</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rango" id="rango" />
                <label htmlFor="rango">Rango de fecha</label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CargoDateTypeField;
