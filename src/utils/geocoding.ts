
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
