
export interface Carga {
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
  tipo_carga: string;
  tipo_camion: string;
  cantidad_cargas: number;
  tarifa: number;
  fecha_carga_desde: string;
  fecha_carga_hasta: string | null;
  observaciones: string | null;
  estado: string;
  usuario_id: string;
  created_at: string;
  updated_at: string;
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
