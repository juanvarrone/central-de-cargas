
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiConfiguration from "./ApiConfiguration";
import SystemVariables from "./SystemVariables";
import PremiumSettings from "./PremiumSettings";
import { Key, Settings, Tag, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Base de Datos</span>
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
        
        <TabsContent value="database" className="w-full">
          <DatabaseConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const DatabaseConfiguration = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast({
      title: "Copiado al portapapeles",
      description: `${field} copiado correctamente`,
    });
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Base de Datos</CardTitle>
          <CardDescription>
            Acceso a la base de datos de Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-blue-800 text-sm font-medium mb-2">Información importante</h3>
            <p className="text-blue-700 text-sm">
              Esta sección muestra la información de conexión a la base de datos. 
              Para modificar las credenciales o configuración de la base de datos, 
              debe hacerlo directamente desde el panel de administración de Supabase.
            </p>
            <div className="flex mt-4">
              <a 
                href={`https://supabase.com/dashboard/project/yeyubdwclifbgbqivrsu`} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <span>Ir al panel de Supabase</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project_id">ID de Proyecto</Label>
              <div className="flex">
                <Input
                  id="project_id"
                  value="yeyubdwclifbgbqivrsu"
                  className="font-mono"
                  readOnly
                />
                <Button 
                  variant="outline"
                  className="ml-2" 
                  onClick={() => handleCopy("yeyubdwclifbgbqivrsu", "ID de Proyecto")}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-sm text-gray-500">Identificador único de su proyecto en Supabase</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="db_url">URL de la base de datos</Label>
              <div className="flex">
                <Input
                  id="db_url"
                  value="postgresql://postgres:[PASSWORD]@db.yeyubdwclifbgbqivrsu.supabase.co:5432/postgres"
                  className="font-mono"
                  readOnly
                />
                <Button 
                  variant="outline"
                  className="ml-2" 
                  onClick={() => handleCopy("postgresql://postgres:[PASSWORD]@db.yeyubdwclifbgbqivrsu.supabase.co:5432/postgres", "URL de la base de datos")}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-sm text-gray-500">Cadena de conexión para acceder a su base de datos (reemplace [PASSWORD] con su contraseña)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="anon_key">Clave Anónima</Label>
              <div className="flex">
                <Input
                  id="anon_key"
                  value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleXViZHdjbGlmYmdicWl2cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTU3MjcsImV4cCI6MjA1NTI5MTcyN30.mjMAZTv9efiuTluZeVUKiR8T31NHwVCgJ0e8f3RBxnc"
                  className="font-mono"
                  readOnly
                />
                <Button 
                  variant="outline"
                  className="ml-2" 
                  onClick={() => handleCopy("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlleXViZHdjbGlmYmdicWl2cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTU3MjcsImV4cCI6MjA1NTI5MTcyN30.mjMAZTv9efiuTluZeVUKiR8T31NHwVCgJ0e8f3RBxnc", "Clave Anónima")}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-sm text-gray-500">Clave de autenticación para acceso anónimo</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api_url">URL de la API</Label>
              <div className="flex">
                <Input
                  id="api_url"
                  value="https://yeyubdwclifbgbqivrsu.supabase.co"
                  className="font-mono"
                  readOnly
                />
                <Button 
                  variant="outline"
                  className="ml-2" 
                  onClick={() => handleCopy("https://yeyubdwclifbgbqivrsu.supabase.co", "URL de la API")}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-sm text-gray-500">URL base para acceder a las APIs de Supabase</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationManagement;
