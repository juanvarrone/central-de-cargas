
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UserAlert } from '@/hooks/useUserAlerts';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface AlertFormProps {
  defaultValues?: UserAlert;
  onSubmit: (data: Partial<UserAlert>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isCamionero?: boolean;
  isDador?: boolean;
}

const AlertForm = ({ 
  defaultValues, 
  onSubmit, 
  onCancel, 
  isSubmitting,
  isCamionero = false,
  isDador = false
}: AlertFormProps) => {
  const form = useForm<UserAlert>({
    defaultValues: defaultValues || {
      name: '',
      locations: [],
      date_from: null,
      date_to: null,
      radius_km: 50,
      notify_new_loads: true,
      notify_available_trucks: true
    }
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleSubmit = form.handleSubmit((data) => {
    const formattedData = {
      ...data,
      locations: typeof data.locations === 'string' ? data.locations.split(',') : data.locations
    };
    onSubmit(formattedData);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la alerta</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Viajes a Buenos Aires" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicaciones de Interés</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: Buenos Aires, Córdoba"
                  {...field}
                  value={Array.isArray(field.value) ? field.value.join(',') : field.value}
                  onChange={(e) => field.onChange(e.target.value.split(','))}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Desde</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Hasta</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="radius_km"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Radio de búsqueda (km)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  min={1}
                  max={500}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          {isDador && (
            <FormField
              control={form.control}
              name="notify_available_trucks"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Notificar Transportistas Disponibles</FormLabel>
                    <p className="text-sm text-neutral-500">
                      Recibe alertas cuando haya transportistas disponibles en tu zona
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {isCamionero && (
            <FormField
              control={form.control}
              name="notify_new_loads"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Notificar Nuevas Cargas</FormLabel>
                    <p className="text-sm text-neutral-500">
                      Recibe alertas cuando aparezcan cargas que coincidan con tus criterios
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {defaultValues?.id ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AlertForm;
