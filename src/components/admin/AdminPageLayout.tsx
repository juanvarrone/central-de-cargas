
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ModuleManagement from "./ModuleManagement";
import UserManagement from "./UserManagement";
import ConfigurationManagement from "./ConfigurationManagement";
import QueryMonitorPanel from "./QueryMonitorPanel";
import { Settings, Activity } from "lucide-react";

const AdminPageLayout = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      {/* Query Monitor Panel - Always visible at top */}
      <div className="mb-8">
        <QueryMonitorPanel />
      </div>
      
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="modules">Gestión de Módulos</TabsTrigger>
          <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="modules" className="w-full">
          <ModuleManagement />
        </TabsContent>
        
        <TabsContent value="users" className="w-full">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="configuration" className="w-full">
          <ConfigurationManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPageLayout;
