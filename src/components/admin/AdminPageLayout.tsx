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
import SubmissionMonitorPanel from "./SubmissionMonitorPanel";
import { Settings, Activity, Database, Upload } from "lucide-react";

const AdminPageLayout = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="mb-6 grid grid-cols-5 w-full">
          <TabsTrigger value="modules">Gestión de Módulos</TabsTrigger>
          <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
          <TabsTrigger value="db-monitor" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Monitor DB</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Envíos</span>
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
        
        <TabsContent value="db-monitor" className="w-full">
          <QueryMonitorPanel />
        </TabsContent>
        
        <TabsContent value="submissions" className="w-full">
          <SubmissionMonitorPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPageLayout;