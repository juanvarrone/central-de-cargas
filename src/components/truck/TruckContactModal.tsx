
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TruckContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData?: {
    full_name: string | null;
    phone_number: string | null;
    user_id: string;
  } | null;
  loginRequired: boolean;
}

const TruckContactModal = ({ 
  open, 
  onOpenChange, 
  userData, 
  loginRequired 
}: TruckContactModalProps) => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/auth", { state: { from: "/buscar-camiones" } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {loginRequired ? (
            <>
              <DialogTitle>Iniciar sesión requerido</DialogTitle>
              <DialogDescription>
                Para ver la información de contacto de este camión, primero debes iniciar sesión.
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>Información de contacto</DialogTitle>
              <DialogDescription>
                Datos de contacto del transportista
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {loginRequired ? (
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLoginRedirect}>
              Iniciar sesión
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {userData && (
              <>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">Nombre</p>
                    <p className="font-medium">{userData.full_name || "No disponible"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">Teléfono</p>
                    <p className="font-medium">{userData.phone_number || "No disponible"}</p>
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                  >
                    Cerrar
                  </Button>
                  <Button 
                    onClick={() => navigate(`/perfil/${userData.user_id}`)}
                    variant="default"
                  >
                    Ver perfil completo
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TruckContactModal;
