
import { Loader2 } from "lucide-react";

const AdminLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-lg">Cargando panel de administración...</div>
      </div>
    </div>
  );
};

export default AdminLoading;
