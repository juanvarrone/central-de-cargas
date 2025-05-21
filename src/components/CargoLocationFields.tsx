import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { useEffect, useRef } from "react";
import { useApiConfiguration } from "@/hooks/useApiConfiguration";

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
  const { config } = useApiConfiguration("GOOGLE_MAPS_API_KEY");

  useEffect(() => {
    if (!window.google || !config?.value) return;
    
    const setupAutocomplete = (inputRef: HTMLInputElement | null, onPlaceSelect: (value: string) => void, fieldType: 'origen' | 'destino') => {
      if (!inputRef) return;

      const autocomplete = new google.maps.places.Autocomplete(inputRef, {
        componentRestrictions: { country: "ar" },
        fields: ["address_components", "formatted_address", "geometry", "name"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        
        if (place.formatted_address) {
          // Update the form value with the formatted address
          form.setValue(fieldType, place.formatted_address);
          
          // Call the change handler with the formatted address
          onPlaceSelect(place.formatted_address);
          
          // Extract province and city from address components
          if (place.address_components) {
            let provincia = '';
            let ciudad = '';
            
            for (const component of place.address_components) {
              const types = component.types;
              
              if (types.includes('administrative_area_level_1')) {
                provincia = component.long_name;
              }
              
              if (types.includes('locality') || types.includes('administrative_area_level_2')) {
                ciudad = component.long_name;
              }
            }
            
            // Set the province and city in the form
            if (fieldType === 'origen') {
              form.setValue('origen_provincia', provincia);
              form.setValue('origen_ciudad', ciudad);
            } else {
              form.setValue('destino_provincia', provincia);
              form.setValue('destino_ciudad', ciudad);
            }
            
            // Set coordinates
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              
              if (fieldType === 'origen') {
                form.setValue('origen_lat', lat);
                form.setValue('origen_lng', lng);
              } else {
                form.setValue('destino_lat', lat);
                form.setValue('destino_lng', lng);
              }
            }
          }
        }
      });
    };

    setupAutocomplete(origenRef.current, onOrigenChange, 'origen');
    setupAutocomplete(destinoRef.current, onDestinoChange, 'destino');
  }, [onOrigenChange, onDestinoChange, form, config]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="origen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domicilio de origen</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    ref={origenRef}
                    placeholder="Ingrese dirección de origen"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="origen_provincia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      readOnly
                      placeholder="Provincia"
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="origen_ciudad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      readOnly
                      placeholder="Ciudad"
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
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
                <FormLabel>Domicilio de destino</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    ref={destinoRef}
                    placeholder="Ingrese dirección de destino"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="destino_provincia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      readOnly
                      placeholder="Provincia"
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="destino_ciudad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      readOnly
                      placeholder="Ciudad"
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
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
