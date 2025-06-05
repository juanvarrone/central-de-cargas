
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Map as MapIcon, 
  List
} from "lucide-react";
import TruckMapFilters from "@/components/truck/TruckMapFilters";
import TruckListView from "@/components/truck/TruckListView";
import TrucksMapa from "@/components/truck/TrucksMapa";
import { TruckFilters } from "@/types/truck";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const BuscarCamiones = () => {
  const [filters, setFilters] = useState<TruckFilters>({});
  const [view, setView] = useState<"map" | "list">("list");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFilterChange = (newFilters: TruckFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center mb-4 py-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold text-primary">
              Buscar Camiones
            </h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
          <div>
            <Card className="p-4 sticky top-4">
              <TruckMapFilters onFilterChange={handleFilterChange} />
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-4">
              <CardContent className="p-0">
                <Tabs value={view} onValueChange={(v) => setView(v as "map" | "list")} className="w-full">
                  <div className="flex justify-end mb-3">
                    <TabsList>
                      <TabsTrigger value="list" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        <span className="hidden sm:inline">Lista</span>
                      </TabsTrigger>
                      <TabsTrigger value="map" className="flex items-center gap-2">
                        <MapIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Mapa</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="list" className="w-full mt-0">
                    <TruckListView filters={filters} />
                  </TabsContent>
                  
                  <TabsContent value="map" className="w-full mt-0">
                    <div className="h-[60vh] w-full rounded-md overflow-hidden border">
                      <TrucksMapa filters={filters} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuscarCamiones;
