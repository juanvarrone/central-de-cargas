
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import MapLocationInput from "@/components/MapLocationInput";

interface LocationInputsProps {
  value: string[];
  onChange: (locations: string[]) => void;
  maxLocations?: number;
}

const LocationInputs = ({ value = [], onChange, maxLocations = 5 }: LocationInputsProps) => {
  const [locations, setLocations] = useState<string[]>(value.length > 0 ? value : [""]);
  const [validationStates, setValidationStates] = useState<boolean[]>([false]);

  useEffect(() => {
    if (value.length > 0) {
      setLocations(value);
      setValidationStates(new Array(value.length).fill(true)); // Assume existing values are valid
    }
  }, [value]);

  const handleLocationChange = (index: number, location: string, placeData?: google.maps.places.PlaceResult) => {
    const newLocations = [...locations];
    newLocations[index] = location;
    setLocations(newLocations);
    
    // Only include valid locations
    const validLocations = newLocations.filter((loc, i) => loc.trim() !== "" && validationStates[i]);
    onChange(validLocations);
  };

  const handleValidationChange = (index: number, isValid: boolean) => {
    const newValidationStates = [...validationStates];
    newValidationStates[index] = isValid;
    setValidationStates(newValidationStates);
    
    // Update onChange with only valid locations
    const validLocations = locations.filter((loc, i) => loc.trim() !== "" && newValidationStates[i]);
    onChange(validLocations);
  };

  const addLocation = () => {
    if (locations.length < maxLocations) {
      const newLocations = [...locations, ""];
      const newValidationStates = [...validationStates, false];
      setLocations(newLocations);
      setValidationStates(newValidationStates);
    }
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      const newLocations = locations.filter((_, i) => i !== index);
      const newValidationStates = validationStates.filter((_, i) => i !== index);
      setLocations(newLocations);
      setValidationStates(newValidationStates);
      
      // Update onChange with only valid locations
      const validLocations = newLocations.filter((loc, i) => loc.trim() !== "" && newValidationStates[i]);
      onChange(validLocations);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Ubicaciones (máximo {maxLocations})
        </Label>
        {locations.length < maxLocations && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLocation}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Agregar
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {locations.map((location, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1">
              <MapLocationInput
                id={`location-${index}`}
                label=""
                value={location}
                onChange={(value, placeData) => handleLocationChange(index, value, placeData)}
                onValidationChange={(isValid) => handleValidationChange(index, isValid)}
                placeholder={`Ubicación ${index + 1}`}
                className="w-full"
                required
              />
            </div>
            {locations.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeLocation(index)}
                className="mt-0 h-10 w-10 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationInputs;
