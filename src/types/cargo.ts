
import { z } from "zod";

export const cargaSchema = z.object({
  origen: z.string().min(2, "El origen es requerido"),
  origen_detalle: z.string().min(2, "El detalle del origen es requerido"),
  origen_provincia: z.string().min(2, "La provincia de origen es requerida"),
  origen_ciudad: z.string().min(2, "La ciudad de origen es requerida"),
  destino: z.string().min(2, "El destino es requerido"),
  destino_detalle: z.string().min(2, "El detalle del destino es requerido"),
  destino_provincia: z.string().min(2, "La provincia de destino es requerida"),
  destino_ciudad: z.string().min(2, "La ciudad de destino es requerida"),
  tipo_fecha: z.enum(["exacta", "rango"]),
  fecha_carga_desde: z.string().min(1, "La fecha de carga es requerida"),
  fecha_carga_hasta: z.string().optional(),
  cantidadCargas: z.number().min(1).max(10),
  tipoCarga: z.string().min(2, "El tipo de carga es requerido"),
  tipoCamion: z.string().min(2, "El tipo de camión es requerido"),
  tarifa: z.string().min(1, "La tarifa es requerida"),
  tipo_tarifa: z.enum(["por_viaje", "por_tonelada"], {
    required_error: "El tipo de tarifa es requerido"
  }),
  observaciones: z.string().optional(),
  origen_lat: z.number(),
  origen_lng: z.number(),
  destino_lat: z.number(),
  destino_lng: z.number(),
});

export type CargaFormData = z.infer<typeof cargaSchema>;
