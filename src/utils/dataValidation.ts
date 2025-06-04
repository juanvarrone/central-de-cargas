
import { TruckAvailabilityRaw, TruckAvailability } from "@/types/truck";

// Utility function to check if profiles data is valid
export const isValidProfilesData = (profiles: any): profiles is { id: string; full_name: string | null; phone_number: string | null; } => {
  if (!profiles) return false;
  if (typeof profiles !== 'object') return false;
  if ('error' in profiles) return false;
  return typeof profiles.id === 'string';
};

// Transform raw Supabase response to clean TruckAvailability
export const processTruckData = (rawTrucks: TruckAvailabilityRaw[]): TruckAvailability[] => {
  return rawTrucks
    .filter(truck => {
      // Filter out any trucks that have fundamental issues
      return truck.id && truck.tipo_camion && truck.capacidad;
    })
    .map(truck => ({
      ...truck,
      profiles: isValidProfilesData(truck.profiles) ? truck.profiles : null
    }));
};

// Similar function for TruckWithLocation (map component)
export const processTruckMapData = (rawTrucks: any[]): any[] => {
  return rawTrucks
    .filter(truck => {
      // Filter out any trucks that have fundamental issues
      return truck.id && truck.tipo_camion && truck.capacidad;
    })
    .map(truck => ({
      ...truck,
      profiles: isValidProfilesData(truck.profiles) ? truck.profiles : null
    }));
};
