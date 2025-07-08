import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { cargoSchema, type CargoFormData } from '@/types/cargo';
import MapLocationInput from '@/components/MapLocationInput';
import PublishCargoMap from './PublishCargoMap';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface CargoFormProps {
  onSubmit: (data: CargoFormData) => Promise<void>;
  loading: boolean;
  defaultValues?: Partial<CargoFormData>;
  isCopy?: boolean;
}

const CargoForm = ({ onSubmit, loading, defaultValues, isCopy = false }: CargoFormProps) => {
  const [origenValid, setOrigenValid] = useState(false);
  const [destinoValid, setDestinoValid] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CargoFormData>({
    resolver: zodResolver(cargoSchema),
    defaultValues: {
      cantidad_cargas: 1,
      tipo_tarifa: 'por_viaje',
      tarifa_aproximada: false,
      modo_pago: '',
      origen: '',
      destino: '',
      ...defaultValues,
    },
  });

  // Reset form with default values when they change
  useEffect(() => {
    if (defaultValues) {
      reset({
        cantidad_cargas: 1,
        tipo_tarifa: 'por_viaje',
        tarifa_aproximada: false,
        modo_pago: '',
        origen: '',
        destino: '',
        ...defaultValues,
      });
      
      // If copying and we have coordinates, mark locations as valid
      if (isCopy && defaultValues.origen && defaultValues.origen_lat && defaultValues.origen_lng) {
        setOrigenValid(true);
      }
      if (isCopy && defaultValues.destino && defaultValues.destino_lat && defaultValues.destino_lng) {
        setDestinoValid(true);
      }
    }
  }, [defaultValues, reset, isCopy]);

  const watchedValues = watch();
  const origen = watch('origen');
  const destino = watch('destino');

  const handleFormSubmit = async (data: CargoFormData) => {
    // Validate Google Places selections before submitting
    if (!origenValid) {
      alert('Debe seleccionar un origen válido de la lista de Google Places');
      return;
    }
    
    if (!destinoValid) {
      alert('Debe seleccionar un destino válido de la lista de Google Places');
      return;
    }

    await onSubmit(data);
  };

  const handleOrigenChange = (location: string, placeData?: google.maps.places.PlaceResult) => {
    console.log('Origen changed:', location, placeData);
    setValue('origen', location);
    
    if (placeData && placeData.geometry?.location) {
      const lat = placeData.geometry.location.lat();
      const lng = placeData.geometry.location.lng();
      setValue('origen_lat', lat);
      setValue('origen_lng', lng);
      
      // Extract province and city from address components
      if (placeData.address_components) {
        let provincia = '';
        let ciudad = '';
        
        for (const component of placeData.address_components) {
          const types = component.types;
          
          if (types.includes('administrative_area_level_1')) {
            provincia = component.long_name;
          }
          
          if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            ciudad = component.long_name;
          }
        }
        
        setValue('origen_provincia', provincia);
        setValue('origen_ciudad', ciudad);
      }
    }
  };

  const handleDestinoChange = (location: string, placeData?: google.maps.places.PlaceResult) => {
    console.log('Destino changed:', location, placeData);
    setValue('destino', location);
    
    if (placeData && placeData.geometry?.location) {
      const lat = placeData.geometry.location.lat();
      const lng = placeData.geometry.location.lng();
      setValue('destino_lat', lat);
      setValue('destino_lng', lng);
      
      // Extract province and city from address components
      if (placeData.address_components) {
        let provincia = '';
        let ciudad = '';
        
        for (const component of placeData.address_components) {
          const types = component.types;
          
          if (types.includes('administrative_area_level_1')) {
            provincia = component.long_name;
          }
          
          if (types.includes('locality') || types.includes('administrative_area_level_2')) {
            ciudad = component.long_name;
          }
        }
        
        setValue('destino_provincia', provincia);
        setValue('destino_ciudad', ciudad);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        {isCopy && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Se han copiado los datos de una carga existente. Modifique las fechas y cualquier otro dato según sea necesario antes de publicar.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Carga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="tipo_carga">Tipo de Carga *</Label>
                  <Input
                    id="tipo_carga"
                    placeholder="Ej: Cereales, Hacienda, Maquinaria..."
                    maxLength={50}
                    className="mt-2"
                    {...register('tipo_carga')}
                  />
                  {errors.tipo_carga && (
                    <p className="text-sm text-red-500 mt-1">{errors.tipo_carga.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tipo_camion">Tipo de Camión Requerido *</Label>
                  <Input
                    id="tipo_camion"
                    placeholder="Ej: Furgón, Chasis, Semirremolque..."
                    maxLength={50}
                    className="mt-2"
                    {...register('tipo_camion')}
                  />
                  {errors.tipo_camion && (
                    <p className="text-sm text-red-500 mt-1">{errors.tipo_camion.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="cantidad_cargas">Cantidad de Cargas</Label>
                <Input
                  type="number"
                  min="1"
                  className="mt-2"
                  {...register('cantidad_cargas', { valueAsNumber: true })}
                />
                {errors.cantidad_cargas && (
                  <p className="text-sm text-red-500 mt-1">{errors.cantidad_cargas.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ubicaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <MapLocationInput
                id="origen"
                label="Origen"
                value={origen}
                onChange={handleOrigenChange}
                onValidationChange={setOrigenValid}
                placeholder="Ingrese dirección de origen"
                required
              />
              {errors.origen && (
                <p className="text-sm text-red-500">{errors.origen.message}</p>
              )}

              <MapLocationInput
                id="destino"
                label="Destino"
                value={destino}
                onChange={handleDestinoChange}
                onValidationChange={setDestinoValid}
                placeholder="Ingrese dirección de destino"
                required
              />
              {errors.destino && (
                <p className="text-sm text-red-500">{errors.destino.message}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Fecha de Carga Desde *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2",
                        !watchedValues.fecha_carga_desde && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedValues.fecha_carga_desde ? (
                        format(new Date(watchedValues.fecha_carga_desde), "PPP", { locale: es })
                      ) : (
                        <span>Seleccione fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watchedValues.fecha_carga_desde ? new Date(watchedValues.fecha_carga_desde) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setValue('fecha_carga_desde', format(date, 'yyyy-MM-dd'));
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.fecha_carga_desde && (
                  <p className="text-sm text-red-500 mt-1">{errors.fecha_carga_desde.message}</p>
                )}
              </div>

              <div>
                <Label>Fecha de Carga Hasta (opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2",
                        !watchedValues.fecha_carga_hasta && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedValues.fecha_carga_hasta ? (
                        format(new Date(watchedValues.fecha_carga_hasta), "PPP", { locale: es })
                      ) : (
                        <span>Seleccione fecha final (opcional)</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watchedValues.fecha_carga_hasta ? new Date(watchedValues.fecha_carga_hasta) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setValue('fecha_carga_hasta', format(date, 'yyyy-MM-dd'));
                        } else {
                          setValue('fecha_carga_hasta', undefined);
                        }
                      }}
                      disabled={(date) => {
                        const fromDate = watchedValues.fecha_carga_desde ? new Date(watchedValues.fecha_carga_desde) : new Date();
                        return date < fromDate;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarifa y Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tarifa">Tarifa *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="mt-2"
                      {...register('tarifa', { valueAsNumber: true })}
                    />
                    {errors.tarifa && (
                      <p className="text-sm text-red-500 mt-1">{errors.tarifa.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tipo_tarifa">Tipo de Tarifa *</Label>
                    <Select onValueChange={(value) => setValue('tipo_tarifa', value as 'por_viaje' | 'por_tonelada')}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="por_viaje">Por Viaje</SelectItem>
                        <SelectItem value="por_tonelada">Por Tonelada</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipo_tarifa && (
                      <p className="text-sm text-red-500 mt-1">{errors.tipo_tarifa.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="modo_pago">Modo de Pago</Label>
                  <Input
                    placeholder="Ej: Efectivo, Transferencia, etc."
                    className="mt-2"
                    {...register('modo_pago')}
                  />
                  {errors.modo_pago && (
                    <p className="text-sm text-red-500 mt-1">{errors.modo_pago.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="tarifa_aproximada"
                    checked={watchedValues.tarifa_aproximada}
                    onCheckedChange={(checked) => setValue('tarifa_aproximada', checked as boolean)}
                  />
                  <Label htmlFor="tarifa_aproximada">
                    La tarifa es aproximada (sujeta a negociación)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Agregue información adicional sobre la carga..."
                className="resize-none"
                rows={4}
                {...register('observaciones')}
              />
              {errors.observaciones && (
                <p className="text-sm text-red-500 mt-2">{errors.observaciones.message}</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading || !origenValid || !destinoValid} 
              className="w-full md:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Publicando...' : 'Publicar Carga'}
            </Button>
          </div>
        </form>
      </div>

      <div className="lg:sticky lg:top-4">
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa del Recorrido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <PublishCargoMap
                origen={origen}
                destino={destino}
                className="h-full rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CargoForm;
