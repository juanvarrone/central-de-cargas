
import React from "react";
import { useNavigate } from "react-router-dom";

interface AdminDebugInfoProps {
  debugInfo: any;
}

const AdminDebugInfo = ({ debugInfo }: AdminDebugInfoProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-red-600">Error de permisos de administrador</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Información de debug:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
        
        <div className="mt-4">
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDebugInfo;
