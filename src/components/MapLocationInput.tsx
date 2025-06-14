
import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, AlertCircle, Check, X } from "lucide-react";
import { useApiConfiguration } from "@/hooks/useApiConfiguration";
import { useLoadScript } from "@react-google-maps/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

const libraries: ("places")[] = ["places"];

interface MapLocationInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (location: string, placeData?: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const MapLocationInput = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Ingrese ubicación",
  required = false,
  className = "",
  onValidationChange,
}: MapLocationInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [autocompleteReady, setAutocompleteReady] = useState(false);
  const [isValidSelection, setIsValidSelection] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const { config, loading: apiKeyLoading, error: configError } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const apiKey = config?.value || "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Initialize autocomplete when everything is ready
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google?.maps?.places || !apiKey || autocompleteRef.current) {
      return;
    }

    try {
      console.log("Initializing Google Places Autocomplete for", id, "with API key:", apiKey.substring(0, 10) + "...");
      
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'ar' },
        fields: ['formatted_address', 'geometry', 'place_id', 'address_components']
      });

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        console.log("Place selected:", place);
        
        if (place && place.formatted_address) {
          setIsValidSelection(true);
          setUserTyping(false);
          onChange(place.formatted_address, place);
          onValidationChange?.(true);
        } else {
          console.warn("No formatted address in selected place");
          setIsValidSelection(false);
          onValidationChange?.(false);
        }
      });

      autocompleteRef.current = autocompleteInstance;
      setAutocompleteReady(true);
      setInitializationError(null);
      console.log("✓ Autocomplete initialized successfully for", id);
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
      setInitializationError("Error al inicializar el autocompletado de Google Places");
      setAutocompleteReady(false);
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
        setAutocompleteReady(false);
      }
    };
  }, [isLoaded, onChange, id, apiKey, onValidationChange]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUserTyping(true);
    setIsValidSelection(false);
    onChange(newValue);
    onValidationChange?.(false);
  };

  // Validate existing value
  useEffect(() => {
    if (value && !userTyping) {
      // If there's a value and user is not typing, consider it valid (for pre-filled forms)
      setIsValidSelection(true);
      onValidationChange?.(true);
    } else if (!value) {
      setIsValidSelection(false);
      onValidationChange?.(false);
    }
  }, [value, userTyping, onValidationChange]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full"
          required={required}
        />
      </div>
    );
  }

  const getValidationIcon = () => {
    if (!value) return null;
    if (userTyping) return null;
    
    if (isValidSelection) {
      return <Check className="h-4 w-4 text-green-500" />;
    } else if (value && !isValidSelection) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getValidationMessage = () => {
    if (!value) return null;
    if (userTyping) return "Seleccione una opción de la lista";
    
    if (isValidSelection) {
      return "✓ Ubicación válida seleccionada";
    } else if (value && !isValidSelection) {
      return "⚠️ Debe seleccionar una ubicación de la lista de Google Places";
    }
    return null;
  };

  const getValidationColor = () => {
    if (!value || userTyping) return "text-yellow-600";
    return isValidSelection ? "text-green-600" : "text-red-500";
  };

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
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full pr-10 ${
            value && !userTyping 
              ? isValidSelection 
                ? "border-green-500 focus:border-green-500" 
                : "border-red-500 focus:border-red-500"
              : ""
          }`}
          required={required}
          disabled={apiKeyLoading || !apiKey || !!loadError}
        />

        {(apiKeyLoading || (!isLoaded && apiKey && !loadError)) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        {getValidationIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
      </div>
      
      {isLoaded && apiKey && !loadError && !initializationError && autocompleteReady && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Google Places habilitado
        </p>
      )}
      
      {isLoaded && apiKey && !loadError && !initializationError && !autocompleteReady && (
        <p className="text-xs text-yellow-600 mt-1">
          ⚠️ Inicializando Google Places...
        </p>
      )}

      {getValidationMessage() && (
        <p className={`text-xs mt-1 ${getValidationColor()}`}>
          {getValidationMessage()}
        </p>
      )}
    </div>
  );
};

export default MapLocationInput;
