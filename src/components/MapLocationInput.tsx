
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { useApiConfiguration } from "@/hooks/useApiConfiguration";
import { useLoadScript } from "@react-google-maps/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const { config, loading: apiKeyLoading, error: configError } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const apiKey = config?.value || "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google || autocomplete || !apiKey) return;

    try {
      console.log("Initializing Google Places Autocomplete for", id);
      
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
      setInitializationError(null);
      console.log("Autocomplete initialized successfully for", id);
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
      setInitializationError("Error al inicializar el autocompletado de Google Places");
    }

    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [isLoaded, onChange, id, autocomplete, apiKey]);

  // Show configuration error
  if (configError) {
    return (
      <div className={`relative ${className}`}>
        {label && (
          <Label htmlFor={id} className="block text-sm font-medium mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar la configuración de Google Maps. Contacte al administrador.
          </AlertDescription>
        </Alert>
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full"
          required={required}
          disabled={true}
        />
      </div>
    );
  }

  // Show API key missing error
  if (!apiKey && !apiKeyLoading) {
    return (
      <div className={`relative ${className}`}>
        {label && (
          <Label htmlFor={id} className="block text-sm font-medium mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La API key de Google Maps no está configurada. Configure la API key en el panel de administración.
          </AlertDescription>
        </Alert>
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full"
          required={required}
        />
      </div>
    );
  }

  // Show Google Maps load error
  if (loadError) {
    return (
      <div className={`relative ${className}`}>
        {label && (
          <Label htmlFor={id} className="block text-sm font-medium mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar Google Maps: {loadError.message}. Verifique que la API key tenga los permisos correctos.
          </AlertDescription>
        </Alert>
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full"
          required={required}
        />
      </div>
    );
  }

  // Show initialization error
  if (initializationError) {
    return (
      <div className={`relative ${className}`}>
        {label && (
          <Label htmlFor={id} className="block text-sm font-medium mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        )}
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {initializationError}
          </AlertDescription>
        </Alert>
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full"
          required={required}
        />
      </div>
    );
  }

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
      
      {isLoaded && apiKey && !loadError && !initializationError && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Google Places habilitado
        </p>
      )}
    </div>
  );
};

export default MapLocationInput;
