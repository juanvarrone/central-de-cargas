
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
  const [isValidSelection, setIsValidSelection] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { config, loading: apiKeyLoading, error: configError } = useApiConfiguration("GOOGLE_MAPS_API_KEY");
  const apiKey = config?.value || "";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Initialize autocomplete only once when everything is ready
  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google?.maps?.places || !apiKey || isInitialized) {
      return;
    }

    console.log("Initializing Google Places Autocomplete for", id);
    
    try {
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: 'ar' },
        fields: ['formatted_address', 'geometry', 'place_id', 'address_components']
      });

      const handlePlaceChanged = () => {
        const place = autocompleteInstance.getPlace();
        console.log("Place selected:", place);
        
        if (place?.formatted_address && place?.geometry?.location) {
          console.log("Valid place selected:", place.formatted_address);
          setIsValidSelection(true);
          setUserTyping(false);
          onChange(place.formatted_address, place);
          onValidationChange?.(true);
        } else {
          console.warn("Invalid place selected");
          setIsValidSelection(false);
          onValidationChange?.(false);
        }
      };

      autocompleteInstance.addListener('place_changed', handlePlaceChanged);
      autocompleteRef.current = autocompleteInstance;
      setIsInitialized(true);
      
      console.log("✓ Autocomplete initialized successfully for", id);
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
      setIsInitialized(false);
    }
  }, [isLoaded, apiKey, id, isInitialized, onChange, onValidationChange]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUserTyping(true);
    setIsValidSelection(false);
    onChange(newValue);
    onValidationChange?.(false);
  };

  // Handle existing values (for pre-filled forms)
  useEffect(() => {
    if (value && !userTyping && !isValidSelection) {
      // If there's a pre-filled value, consider it valid
      setIsValidSelection(true);
      onValidationChange?.(true);
    }
  }, [value, userTyping, isValidSelection, onValidationChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
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
            Error al cargar la configuración de Google Maps.
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
            La API key de Google Maps no está configurada.
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
            Error al cargar Google Maps. Verifique la configuración.
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
      return "⚠️ Debe seleccionar una ubicación de la lista";
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
      
      {isLoaded && apiKey && !loadError && isInitialized && (
        <p className="text-xs text-green-600 mt-1">
          ✓ Google Places habilitado
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
