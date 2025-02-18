
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { useEffect, useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

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
  const origenRef = useRef<HTMLInputElement>(null);
  const destinoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!window.google) return;

    const setupAutocomplete = (inputRef: HTMLInputElement | null, onPlaceSelect: (value: string) => void) => {
      if (!inputRef) return;

      const autocomplete = new google.maps.places.Autocomplete(inputRef, {
        componentRestrictions: { country: "ar" },
        fields: ["address_components", "formatted_address", "geometry"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          onPlaceSelect(place.formatted_address);
        }
      });
    };

    setupAutocomplete(origenRef.current, onOrigenChange);
    setupAutocomplete(destinoRef.current, onDestinoChange);
  }, [onOrigenChange, onDestinoChange]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="origen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origen</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    ref={origenRef}
                    placeholder="Ingrese dirección de origen" 
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
            name="origen_detalle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detalle del origen</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    placeholder="Nombre de empresa/edificio/contacto" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="destino"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destino</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    ref={destinoRef}
                    placeholder="Ingrese dirección de destino"
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
          <FormField
            control={form.control}
            name="destino_detalle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detalle del destino</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    placeholder="Nombre de empresa/edificio/contacto" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default CargoLocationFields;
