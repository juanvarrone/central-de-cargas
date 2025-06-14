
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

  useEffect(() => {
    if (value.length > 0) {
      setLocations(value);
    }
  }, [value]);

  const handleLocationChange = (index: number, location: string) => {
    const newLocations = [...locations];
    newLocations[index] = location;
    setLocations(newLocations);
    
    // Filter out empty locations before sending to parent
    const filteredLocations = newLocations.filter(loc => loc.trim() !== "");
    onChange(filteredLocations);
  };

  const addLocation = () => {
    if (locations.length < maxLocations) {
      const newLocations = [...locations, ""];
      setLocations(newLocations);
    }
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      const newLocations = locations.filter((_, i) => i !== index);
      setLocations(newLocations);
      
      // Filter out empty locations before sending to parent
      const filteredLocations = newLocations.filter(loc => loc.trim() !== "");
      onChange(filteredLocations);
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
                onChange={(value) => handleLocationChange(index, value)}
                placeholder={`Ubicación ${index + 1}`}
                className="w-full"
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
