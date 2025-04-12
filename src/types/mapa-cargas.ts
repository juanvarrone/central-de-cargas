
export interface Carga {
  id: string;
  origen: string;
  origen_ciudad?: string;
  origen_provincia?: string;
  origen_detalle?: string;
  origen_lat?: number;
  origen_lng?: number;
  destino: string;
  destino_ciudad?: string;
  destino_provincia?: string;
  destino_detalle?: string;
  destino_lat?: number;
  destino_lng?: number;
  tipo_carga: string;
  tipo_camion: string;
  estado: string;
  tarifa: number;
  tarifa_aproximada?: boolean;
  fecha_carga_desde: string;
  fecha_carga_hasta?: string | null;
  cantidad_cargas: number;
  observaciones?: string | null;
  created_at: string;
  updated_at: string;
  usuario_id: string;
  postulacion_asignada_id?: string | null;
  fecha_asignacion?: string | null;
}

export interface SelectedCarga {
  carga: Carga;
  tipo: "origen" | "destino";
}

export interface Filters {
  provinciaOrigen?: string;
  provinciaDestino?: string;
  tipoCamion?: string;
}
