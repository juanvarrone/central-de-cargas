
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CargoMapFilters from "@/components/cargo/CargoMapFilters";
import CargasMapa from "@/components/cargo/CargasMapa";
import CargoListView from "@/components/cargo/CargoListView";
import { MapIcon, ListIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const BuscarCargas = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [view, setView] = useState<"map" | "list">("list");

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  return (
    <div className="container max-w-7xl mx-auto py-4 px-4">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Buscar Cargas</h1>
      </div>

      <Card className="p-4 mb-4">
        <CargoMapFilters onFilterChange={handleFilterChange} />
      </Card>

      <Tabs value={view} onValueChange={(v) => setView(v as "map" | "list")} className="w-full">
        <div className="flex justify-end mb-3">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <ListIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Lista</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Mapa</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="list" className="w-full mt-0">
          <CargoListView filters={filters} />
        </TabsContent>
        
        <TabsContent value="map" className="w-full mt-0">
          <div className="h-[60vh] w-full rounded-md overflow-hidden border relative">
            <CargasMapa filters={filters} showSearchBox={true} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuscarCargas;
