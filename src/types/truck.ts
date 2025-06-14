
import { z } from "zod";

export const camionSchema = z.object({
  origen: z.string().optional(),
  origen_detalle: z.string().optional(),
  origen_provincia: z.string().min(2, "La ubicación es requerida"),
  origen_ciudad: z.string().optional(),
  destino: z.string().optional(),
  destino_detalle: z.string().optional(),
  destino_provincia: z.string().optional(), // Now optional as we are not using destination
  destino_ciudad: z.string().optional(),
  tipo_fecha: z.enum(["exacta", "rango"]).optional(),
  fecha_disponible_desde: z.string().optional(),
  fecha_disponible_hasta: z.string().optional(),
  fecha_permanente: z.boolean().optional().default(false),
  tipo_camion: z.string().optional(), // Now optional as it comes from the truck
  capacidad: z.string().optional(), // Now optional as it comes from the truck
  refrigerado: z.boolean().default(false),
  observaciones: z.string().optional(),
  radio_km: z.number().min(0).max(500),
  origen_lat: z.number().optional().default(0),
  origen_lng: z.number().optional().default(0),
  destino_lat: z.number().optional(),
  destino_lng: z.number().optional(),
  selected_trucks: z.array(z.string()).optional(),
});

export type TruckFormData = z.infer<typeof camionSchema>;

export interface TruckFilters {
  provinciaOrigen?: string;
  provinciaDestino?: string;
  tipoCamion?: string;
  fecha?: string;
  radioKm?: number;
  refrigerado?: boolean;
}

// Raw response from Supabase query
export interface TruckAvailabilityRaw {
  id: string;
  origen: string;
  origen_detalle: string | null;
  origen_provincia: string | null;
  origen_ciudad: string | null;
  origen_lat: number | null;
  origen_lng: number | null;
  destino: string;
  destino_detalle: string | null;
  destino_provincia: string | null;
  destino_ciudad: string | null;
  destino_lat: number | null;
  destino_lng: number | null;
  fecha_disponible_desde: string | null;
  fecha_disponible_hasta: string | null;
  tipo_camion: string;
  capacidad: string;
  refrigerado: boolean;
  radio_km: number;
  observaciones: string | null;
  estado: string;
  usuario_id: string;
  created_at: string;
  updated_at: string;
  es_permanente: boolean;
  profiles?: any; // This can be null, an object, or a SelectQueryError
}

// Processed interface for app use
export interface TruckAvailability {
  id: string;
  origen: string;
  origen_detalle: string | null;
  origen_provincia: string | null;
  origen_ciudad: string | null;
  origen_lat: number | null;
  origen_lng: number | null;
  destino: string;
  destino_detalle: string | null;
  destino_provincia: string | null;
  destino_ciudad: string | null;
  destino_lat: number | null;
  destino_lng: number | null;
  fecha_disponible_desde: string | null;
  fecha_disponible_hasta: string | null;
  tipo_camion: string;
  capacidad: string;
  refrigerado: boolean;
  radio_km: number;
  observaciones: string | null;
  estado: string;
  usuario_id: string;
  created_at: string;
  updated_at: string;
  es_permanente: boolean;
  profiles?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
  } | null;
}

// Adding this type for clarity
export interface TruckUser {
  id: string;
  full_name: string | null;
  phone_number: string | null;
}
