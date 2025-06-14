
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CargoMapFilters from "@/components/cargo/CargoMapFilters";
import CargasMapa from "@/components/cargo/CargasMapa";
import { Filters } from "@/types/mapa-cargas";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const MapaCargas = () => {
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFilterChange = (newFilters: Filters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="container max-w-7xl mx-auto">
      <div className="h-[calc(100vh-10rem)] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="text-secondary" />
              Mapa de Cargas
            </h1>
          </div>
          
          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <Filter size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Ajusta los filtros para encontrar las cargas que necesitas
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  <CargoMapFilters onFilterChange={handleFilterChange} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-1 gap-4 h-full">
          <div className="w-80 hidden md:block">
            <Card className="p-4 h-full overflow-auto">
              <div className="sticky top-0">
                <h2 className="text-lg font-medium mb-4">Filtros</h2>
                <CargoMapFilters onFilterChange={handleFilterChange} />
              </div>
            </Card>
          </div>
          <Card className="flex-1 overflow-hidden">
            <div className="h-full">
              <CargasMapa filters={filters} />
            </div>
          </Card>
        </div>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Visualiza las cargas disponibles en el mapa. Utiliza los filtros para encontrar cargas específicas.
        </div>
      </div>
    </div>
  );
};

export default MapaCargas;
