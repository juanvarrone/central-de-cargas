
import { useEffect, useState } from 'react';

type Coordinates = {
  lat: number;
  lng: number;
} | null;

export const geocodeAddress = async (address: string): Promise<Coordinates> => {
  try {
    if (!window.google || !google.maps) {
      console.error("Google Maps API not loaded");
      return null;
    }
    
    const geocoder = new google.maps.Geocoder();
    
    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });

    if (result[0]?.geometry?.location) {
      const location = result[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};

// Hook for Google Places Autocomplete
export const usePlacesAutocomplete = (inputRef: React.RefObject<HTMLInputElement>) => {
  const [place, setPlace] = useState<google.maps.places.PlaceResult | null>(null);

  useEffect(() => {
    // Ensure Google Maps API is loaded
    if (!inputRef.current || !window.google || !google.maps || !google.maps.places) {
      return;
    }

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'], // Restrict to addresses only
        componentRestrictions: { country: 'ar' }, // Restrict to Argentina
      });

      autocomplete.addListener('place_changed', () => {
        try {
          const selectedPlace = autocomplete.getPlace();
          if (selectedPlace && selectedPlace.geometry) {
            setPlace(selectedPlace);
          }
        } catch (err) {
          console.error("Error getting place details:", err);
        }
      });

      return () => {
        // Cleanup if needed
        if (google && google.maps && autocomplete) {
          google.maps.event.clearInstanceListeners(autocomplete);
        }
      };
    } catch (err) {
      console.error("Error setting up Places Autocomplete:", err);
      return undefined;
    }
  }, [inputRef]);

  return { place };
};
