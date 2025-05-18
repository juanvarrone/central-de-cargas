
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { usePlacesAutocomplete } from "@/utils/geocoding";
import { Script } from "./ui/script";
import { Loader2 } from "lucide-react";
import { useApiConfiguration } from "@/hooks/useApiConfiguration";

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
  const { config, loading: apiKeyLoading } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const [mapApiKey, setMapApiKey] = useState<string>("");

  useEffect(() => {
    if (config?.value) {
      setMapApiKey(config.value);
    }
  }, [config]);

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
      {!googleLoaded && mapApiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places`}
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
          disabled={apiKeyLoading || !mapApiKey}
        />

        {(googleLoading || apiKeyLoading) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      {!mapApiKey && !apiKeyLoading && (
        <p className="text-xs text-red-500 mt-1">
          No se ha configurado la API key de Google Maps.
        </p>
      )}
    </div>
  );
};

export default MapLocationInput;
