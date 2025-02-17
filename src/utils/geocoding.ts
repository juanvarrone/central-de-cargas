
type Coordinates = {
  lat: number;
  lng: number;
} | null;

export const geocodeAddress = async (address: string): Promise<Coordinates> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyAyjXoR5-0I-FHD-4NwTvTrF7LWIciirbU`
    );
    const data = await response.json();
    
    if (data.results && data.results[0]) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};
