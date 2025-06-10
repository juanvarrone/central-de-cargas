
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { usePlacesAutocomplete } from '@/utils/geocoding';

interface Location {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface GooglePlacesAlertFormProps {
  onSave: (locations: Location[], alertName: string) => void;
  initialLocations?: Location[];
  initialName?: string;
}

const GooglePlacesAlertForm = ({ 
  onSave, 
  initialLocations = [], 
  initialName = '' 
}: GooglePlacesAlertFormProps) => {
  const [alertName, setAlertName] = useState(initialName);
  const [locations, setLocations] = useState<Location[]>(
    initialLocations.length > 0 ? initialLocations : [{ id: '1', address: '' }]
  );

  const addLocation = () => {
    const newId = (locations.length + 1).toString();
    setLocations([...locations, { id: newId, address: '' }]);
  };

  const removeLocation = (id: string) => {
    if (locations.length > 1) {
      setLocations(locations.filter(loc => loc.id !== id));
    }
  };

  const updateLocation = (id: string, address: string, lat?: number, lng?: number) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, address, lat, lng } : loc
    ));
  };

  const handleSave = () => {
    const validLocations = locations.filter(loc => loc.address.trim() !== '');
    if (validLocations.length > 0 && alertName.trim() !== '') {
      onSave(validLocations, alertName);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Alerta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="alertName">Nombre de la Alerta</Label>
          <Input
            id="alertName"
            value={alertName}
            onChange={(e) => setAlertName(e.target.value)}
            placeholder="Ej: Cargas Buenos Aires - Córdoba"
          />
        </div>

        <div>
          <Label>Ubicaciones de Interés</Label>
          <div className="space-y-3 mt-2">
            {locations.map((location, index) => (
              <LocationInput
                key={location.id}
                location={location}
                index={index}
                onUpdate={updateLocation}
                onRemove={removeLocation}
                canRemove={locations.length > 1}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLocation}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar Ubicación
          </Button>
        </div>

        <Button 
          onClick={handleSave}
          className="w-full"
          disabled={!alertName.trim() || locations.every(loc => !loc.address.trim())}
        >
          Guardar Alerta
        </Button>
      </CardContent>
    </Card>
  );
};

interface LocationInputProps {
  location: Location;
  index: number;
  onUpdate: (id: string, address: string, lat?: number, lng?: number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

const LocationInput = ({ location, index, onUpdate, onRemove, canRemove }: LocationInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { place } = usePlacesAutocomplete(inputRef);

  React.useEffect(() => {
    if (place?.formatted_address && place.geometry?.location) {
      onUpdate(
        location.id,
        place.formatted_address,
        place.geometry.location.lat(),
        place.geometry.location.lng()
      );
    }
  }, [place, location.id, onUpdate]);

  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1">
        <Input
          ref={inputRef}
          value={location.address}
          onChange={(e) => onUpdate(location.id, e.target.value)}
          placeholder={`Ubicación ${index + 1}`}
        />
      </div>
      {canRemove && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onRemove(location.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default GooglePlacesAlertForm;
