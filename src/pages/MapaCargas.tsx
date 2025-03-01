
import { useState } from "react";
import { Card } from "@/components/ui/card";
import CargoMapFilters from "@/components/cargo/CargoMapFilters";
import CargasMapa from "@/components/cargo/CargasMapa";
import { Filters } from "@/types/mapa-cargas";

const MapaCargas = () => {
  const [filters, setFilters] = useState<Filters>({});

  const handleFilterChange = (newFilters: Filters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 h-[calc(100vh-8rem)]">
          <Card className="flex-1 relative">
            <CargasMapa filters={filters} />
          </Card>
          <div className="w-80">
            <Card className="p-4 h-full">
              <CargoMapFilters onFilterChange={handleFilterChange} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaCargas;
