
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

// Utility function to apply client-side date filtering with fallback values
export const applyDateFilter = (items: any[], dateField: string, extraDays: number = 30): any[] => {
  const now = new Date();
  
  return items.filter((item: any) => {
    const endDateField = item[dateField];
    if (!endDateField) return true; // No end date, always visible
    
    const endDate = new Date(endDateField);
    const daysDifference = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Show if within date range or up to configured extra days past end date
    return daysDifference <= extraDays;
  });
};

// Safe database query builder for date-based visibility
export const buildVisibilityQuery = (baseQuery: any, dateField: string, extraDays: number = 30) => {
  const now = new Date();
  const extraDaysAgo = new Date();
  extraDaysAgo.setDate(now.getDate() - extraDays);

  // Build a more robust query that handles null dates and uses fallback
  return baseQuery.or(`${dateField}.is.null,${dateField}.gte.${now.toISOString()},${dateField}.gte.${extraDaysAgo.toISOString()}`);
};
