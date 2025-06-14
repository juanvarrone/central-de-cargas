
import { useState } from 'react';
import { UserAlert } from '@/hooks/useUserAlerts';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AlertsListProps {
  alerts: UserAlert[];
  onEdit: (alert: UserAlert) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const AlertsList = ({ alerts, onEdit, onDelete, isDeleting }: AlertsListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    onDelete(id);
  };

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sin alertas configuradas</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No tienes alertas configuradas. Crea una nueva alerta para recibir notificaciones.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderLocations = (locations: string[] | string) => {
    if (!locations) return '-';
    
    // Handle both array and string formats for backward compatibility
    const locationArray = Array.isArray(locations) ? locations : [locations];
    
    if (locationArray.length === 0) return '-';
    
    return (
      <div className="space-y-1">
        {locationArray.slice(0, 5).map((location, index) => (
          <div key={index} className="text-sm">
            {location}
          </div>
        ))}
        {locationArray.length > 5 && (
          <div className="text-xs text-muted-foreground">
            +{locationArray.length - 5} más...
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Ubicaciones</TableHead>
            <TableHead>Radio (km)</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Creada</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell className="font-medium">{alert.name}</TableCell>
              <TableCell className="max-w-xs">
                {renderLocations(alert.locations)}
              </TableCell>
              <TableCell>{alert.radius_km}</TableCell>
              <TableCell>
                {alert.date_from || alert.date_to ? (
                  `${formatDate(alert.date_from)} a ${formatDate(alert.date_to)}`
                ) : (
                  'Sin período específico'
                )}
              </TableCell>
              <TableCell>
                {alert.created_at && formatDistanceToNow(new Date(alert.created_at), { 
                  addSuffix: true,
                  locale: es 
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(alert)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(alert.id!)}
                    disabled={isDeleting && deletingId === alert.id}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AlertsList;
