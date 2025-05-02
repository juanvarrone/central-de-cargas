
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiConfiguration from "./ApiConfiguration";
import SystemVariables from "./SystemVariables";
import PremiumSettings from "./PremiumSettings";
import { Key, Settings, Tag } from "lucide-react";

const ConfigurationManagement = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="apis" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="apis" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span>APIs y Tokens</span>
          </TabsTrigger>
          <TabsTrigger value="variables" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Variables del Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Cuenta Premium</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="apis" className="w-full">
          <ApiConfiguration />
        </TabsContent>
        
        <TabsContent value="variables" className="w-full">
          <SystemVariables />
        </TabsContent>
        
        <TabsContent value="premium" className="w-full">
          <PremiumSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigurationManagement;
