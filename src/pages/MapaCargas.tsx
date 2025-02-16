
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MapaCargas = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Aquí necesitarás agregar tu token de Mapbox
    mapboxgl.accessToken = "TU_TOKEN_DE_MAPBOX";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-64.0, -34.0], // Centro aproximado de Argentina
      zoom: 4
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Limpieza
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <Card className="h-[calc(100vh-8rem)]">
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
        </Card>
      </div>
    </div>
  );
};

export default MapaCargas;
