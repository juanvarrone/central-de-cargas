
import { z } from "zod";

export const cargoSchema = z.object({
  tipo_carga: z.string().min(1, "Debe especificar el tipo de carga").max(50, "Máximo 50 caracteres"),
  origen: z.string().min(1, "Debe especificar el origen"),
  destino: z.string().min(1, "Debe especificar el destino"),
  fecha_carga_desde: z.string().min(1, "Debe especificar la fecha de carga"),
  fecha_carga_hasta: z.string().optional(),
  tipo_camion: z.string().min(1, "Debe especificar el tipo de camión").max(50, "Máximo 50 caracteres"),
  tarifa: z.number().min(0, "La tarifa debe ser mayor a 0"),
  tipo_tarifa: z.enum(["por_viaje", "por_tonelada"]),
  tarifa_aproximada: z.boolean().default(false),
  modo_pago: z.string().optional(),
  cantidad_cargas: z.number().int().min(1, "Debe ser al menos 1").default(1),
  observaciones: z.string().optional(),
  origen_lat: z.number().optional(),
  origen_lng: z.number().optional(),
  destino_lat: z.number().optional(),
  destino_lng: z.number().optional(),
  origen_provincia: z.string().optional(),
  origen_ciudad: z.string().optional(),
  destino_provincia: z.string().optional(),
  destino_ciudad: z.string().optional(),
});

export type CargoFormData = z.infer<typeof cargoSchema>;

export interface Cargo extends CargoFormData {
  id: string;
  usuario_id: string;
  estado: "disponible" | "asignada" | "completada" | "cancelada";
  created_at: string;
  updated_at: string;
  postulacion_asignada_id?: string;
  fecha_asignacion?: string;
}
