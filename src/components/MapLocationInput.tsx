
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { usePlacesAutocomplete } from "@/utils/geocoding";
import { Script } from "./ui/script";
import { Loader2 } from "lucide-react";

interface MapLocationInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const MapLocationInput = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Ingrese ubicación",
  required = false,
  className = "",
}: MapLocationInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(true);
  const { place } = usePlacesAutocomplete(inputRef);

  useEffect(() => {
    // When a place is selected, update the input value
    if (place && place.formatted_address) {
      onChange(place.formatted_address);
    }
  }, [place, onChange]);

  const handleScriptLoad = () => {
    setGoogleLoaded(true);
    setGoogleLoading(false);
    console.log("Google Maps script loaded successfully");
  };

  return (
    <div className={`relative ${className}`}>
      {!googleLoaded && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyBfn7RKrw6hnkvwTyn4Say_nNtTeWrD-rg&libraries=places`}
          onLoad={handleScriptLoad}
        />
      )}

      <Label htmlFor={id} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full"
          required={required}
        />

        {googleLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapLocationInput;
