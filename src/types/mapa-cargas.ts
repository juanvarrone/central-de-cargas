
export interface Carga {
  id: string;
  origen: string;
  destino: string;
  origen_lat: number;
  origen_lng: number;
  destino_lat: number;
  destino_lng: number;
  origen_detalle: string | null;
  destino_detalle: string | null;
  tipo_carga: string;
  tipo_camion: string;
  fecha_carga_desde: string;
  fecha_carga_hasta: string | null;
  tarifa: number;
  observaciones: string | null;
}

export interface Filters {
  provinciaOrigen?: string;
  provinciaDestino?: string;
  tipoCamion?: string;
}

export interface SelectedCarga {
  carga: Carga;
  tipo: "origen" | "destino";
}
