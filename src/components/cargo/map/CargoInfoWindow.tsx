
import React from 'react';
import { InfoWindow } from '@react-google-maps/api';
import CargoMapInfoWindow from '@/components/cargo/CargoMapInfoWindow';
import { Carga } from '@/types/mapa-cargas';

interface CargoInfoWindowProps {
  selectedCarga: {
    carga: Carga;
    tipo: "origen" | "destino";
  } | null;
  onClose: () => void;
}

const CargoInfoWindow = ({ selectedCarga, onClose }: CargoInfoWindowProps) => {
  if (!selectedCarga) return null;

  const position = selectedCarga.tipo === "origen"
    ? {
        lat: selectedCarga.carga.origen_lat || 0,
        lng: selectedCarga.carga.origen_lng || 0,
      }
    : {
        lat: selectedCarga.carga.destino_lat || 0,
        lng: selectedCarga.carga.destino_lng || 0,
      };

  return (
    <InfoWindow
      position={position}
      onCloseClick={onClose}
    >
      <CargoMapInfoWindow
        cargaId={selectedCarga.carga.id}
        tipo={selectedCarga.tipo}
        lugar={
          selectedCarga.tipo === "origen"
            ? selectedCarga.carga.origen
            : selectedCarga.carga.destino
        }
        detalle={
          selectedCarga.tipo === "origen"
            ? selectedCarga.carga.origen_detalle
            : selectedCarga.carga.destino_detalle
        }
        provincia={
          selectedCarga.tipo === "origen"
            ? selectedCarga.carga.origen_provincia
            : selectedCarga.carga.destino_provincia
        }
        ciudad={
          selectedCarga.tipo === "origen"
            ? selectedCarga.carga.origen_ciudad
            : selectedCarga.carga.destino_ciudad
        }
        tipoCarga={selectedCarga.carga.tipo_carga}
        tipoCamion={selectedCarga.carga.tipo_camion}
        fechaCargaDesde={selectedCarga.carga.fecha_carga_desde}
        fechaCargaHasta={selectedCarga.carga.fecha_carga_hasta}
        tarifa={selectedCarga.carga.tarifa}
        observaciones={selectedCarga.carga.observaciones}
        onClose={onClose}
      />
    </InfoWindow>
  );
};

export default CargoInfoWindow;
