
import { useEffect, useState } from 'react';

type Coordinates = {
  lat: number;
  lng: number;
} | null;

export const geocodeAddress = async (address: string): Promise<Coordinates> => {
  try {
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
    if (!inputRef.current || !window.google || !google.maps || !google.maps.places) {
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'], // Restrict to addresses only
      componentRestrictions: { country: 'ar' }, // Restrict to Argentina
    });

    autocomplete.addListener('place_changed', () => {
      const selectedPlace = autocomplete.getPlace();
      if (selectedPlace && selectedPlace.geometry) {
        setPlace(selectedPlace);
      }
    });

    return () => {
      // Cleanup if needed
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [inputRef]);

  return { place };
};
