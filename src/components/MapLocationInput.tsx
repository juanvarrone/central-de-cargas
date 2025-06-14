
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";
import { useApiConfiguration } from "@/hooks/useApiConfiguration";
import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

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
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const { config, loading: apiKeyLoading } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const apiKey = config?.value || "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google || autocomplete || !apiKey) return;

    try {
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'ar' },
      });

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place && place.formatted_address) {
          onChange(place.formatted_address);
        }
      });

      setAutocomplete(autocompleteInstance);
      console.log("Autocomplete initialized for", id);
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    }

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [isLoaded, onChange, id, autocomplete, apiKey]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <Label htmlFor={id} className="block text-sm font-medium mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full"
          required={required}
          disabled={apiKeyLoading || !apiKey || !!loadError}
        />

        {(apiKeyLoading || (!isLoaded && apiKey && !loadError)) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      
      {!apiKey && !apiKeyLoading && (
        <p className="text-xs text-red-500 mt-1">
          No se ha configurado la API key de Google Maps.
        </p>
      )}

      {loadError && (
        <p className="text-xs text-red-500 mt-1">
          Error al cargar Google Maps. Verifica la configuración.
        </p>
      )}
    </div>
  );
};

export default MapLocationInput;
