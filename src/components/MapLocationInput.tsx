
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const { config, loading: apiKeyLoading } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const apiKey = config?.value || "";

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey || googleLoaded) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setGoogleLoaded(true);
      console.log("Google Maps script loaded for autocomplete");
    };
    
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (!existingScript) {
      document.head.appendChild(script);
    } else {
      setGoogleLoaded(true);
    }

    return () => {
      // Don't remove the script as other components might be using it
    };
  }, [apiKey, googleLoaded]);

  // Initialize autocomplete
  useEffect(() => {
    if (!googleLoaded || !inputRef.current || !window.google || autocomplete) return;

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
  }, [googleLoaded, onChange, id, autocomplete]);

  return (
    <div className={`relative ${className}`}>
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
          disabled={apiKeyLoading || !apiKey}
        />

        {(apiKeyLoading || (!googleLoaded && apiKey)) && (
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
    </div>
  );
};

export default MapLocationInput;
