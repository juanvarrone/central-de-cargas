
import { z } from "zod";

export const camionSchema = z.object({
  origen: z.string().min(2, "El origen es requerido"),
  origen_detalle: z.string().min(2, "El detalle del origen es requerido"),
  origen_provincia: z.string().min(2, "La provincia de origen es requerida"),
  origen_ciudad: z.string().min(2, "La ciudad de origen es requerida"),
  destino: z.string().min(2, "El destino es requerido"),
  destino_detalle: z.string().min(2, "El detalle del destino es requerido"),
  destino_provincia: z.string().min(2, "La provincia de destino es requerida"),
  destino_ciudad: z.string().min(2, "La ciudad de destino es requerida"),
  tipo_fecha: z.enum(["exacta", "rango"]),
  fecha_disponible_desde: z.string().min(1, "La fecha de disponibilidad es requerida"),
  fecha_disponible_hasta: z.string().optional(),
  tipo_camion: z.string().min(2, "El tipo de camión es requerido"),
  capacidad: z.string().min(1, "La capacidad es requerida"),
  refrigerado: z.boolean().default(false),
  observaciones: z.string().optional(),
  radio_km: z.number().min(0).max(500),
  origen_lat: z.number(),
  origen_lng: z.number(),
  destino_lat: z.number(),
  destino_lng: z.number(),
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
  fecha_disponible_desde: string;
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
}
