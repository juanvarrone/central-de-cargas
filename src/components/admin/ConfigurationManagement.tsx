
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiConfiguration from "./ApiConfiguration";
import PremiumSettings from "./PremiumSettings";
import SystemVariables from "./SystemVariables";
import GoogleMapsSettings from "./GoogleMapsSettings";

// Esta función será usada en otro archivo
export const addGoogleMapsTabToConfigManagement = () => {
  // Aquí agregaríamos lógica si fuera necesario
  console.log("Google Maps settings tab added to Configuration Management");
};

// Componente principal de gestión de configuración
const ConfigurationManagement = () => {
  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
      
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="api">APIs</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="system">Variables del Sistema</TabsTrigger>
          <TabsTrigger value="maps">Google Maps</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-4">
          <ApiConfiguration />
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-4">
          <PremiumSettings />
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <SystemVariables />
        </TabsContent>
        
        <TabsContent value="maps" className="space-y-4">
          <GoogleMapsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigurationManagement;
