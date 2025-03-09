
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CargoFilters } from "@/types/mapa-cargas";
import CargoMapFilters from "@/components/cargo/CargoMapFilters";
import CargasMapa from "@/components/cargo/CargasMapa";
import CargoListView from "@/components/cargo/CargoListView";
import { MapIcon, ListIcon } from "lucide-react";

const BuscarCargas = () => {
  const [filters, setFilters] = useState<CargoFilters>({});
  const [view, setView] = useState<"map" | "list">("map");

  const handleFilterChange = (newFilters: CargoFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Buscar Cargas</h1>

      <div className="mb-6">
        <CargoMapFilters onFilterChange={handleFilterChange} />
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "map" | "list")} className="w-full">
        <div className="flex justify-end mb-4">
          <TabsList>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Lista</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="map" className="w-full mt-2">
          <div className="h-[60vh] w-full rounded-md overflow-hidden border">
            <CargasMapa filters={filters} />
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="w-full mt-2">
          <CargoListView filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuscarCargas;
