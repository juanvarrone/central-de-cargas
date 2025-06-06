
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, Save, X } from "lucide-react";

interface CargaRow {
  origen: string;
  destino: string;
  tipo_carga: string;
  tipo_camion: string;
  fecha_carga_desde: string;
  tarifa: string;
  tipo_tarifa: string;
  cantidad_cargas: string;
  observaciones: string;
  errors: string[];
}

interface CargaMasivaFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CargaMasivaForm = ({ onClose, onSuccess }: CargaMasivaFormProps) => {
  const [rows, setRows] = useState<CargaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const emptyRow: CargaRow = {
    origen: "",
    destino: "",
    tipo_carga: "",
    tipo_camion: "",
    fecha_carga_desde: "",
    tarifa: "",
    tipo_tarifa: "por_viaje",
    cantidad_cargas: "1",
    observaciones: "",
    errors: []
  };

  const initializeRows = () => {
    const initialRows = Array(20).fill(null).map(() => ({ ...emptyRow }));
    setRows(initialRows);
  };

  const validateRow = (row: CargaRow, index: number): string[] => {
    const errors: string[] = [];
    
    if (!row.origen.trim()) errors.push("Origen requerido");
    if (!row.destino.trim()) errors.push("Destino requerido");
    if (!row.tipo_carga.trim()) errors.push("Tipo de carga requerido");
    if (!row.tipo_camion.trim()) errors.push("Tipo de camión requerido");
    if (!row.fecha_carga_desde.trim()) errors.push("Fecha requerida");
    
    // Validar fecha
    if (row.fecha_carga_desde.trim()) {
      const fecha = new Date(row.fecha_carga_desde);
      if (isNaN(fecha.getTime())) {
        errors.push("Fecha inválida (formato: YYYY-MM-DD)");
      }
    }
    
    // Validar tarifa
    if (!row.tarifa.trim()) {
      errors.push("Tarifa requerida");
    } else {
      const tarifa = parseFloat(row.tarifa);
      if (isNaN(tarifa) || tarifa <= 0) {
        errors.push("Tarifa debe ser un número positivo");
      }
    }
    
    // Validar cantidad
    if (row.cantidad_cargas.trim()) {
      const cantidad = parseInt(row.cantidad_cargas);
      if (isNaN(cantidad) || cantidad <= 0) {
        errors.push("Cantidad debe ser un número entero positivo");
      }
    }
    
    // Validar tipo de tarifa
    if (row.tipo_tarifa && !["por_viaje", "por_tonelada"].includes(row.tipo_tarifa)) {
      errors.push("Tipo de tarifa debe ser 'por_viaje' o 'por_tonelada'");
    }
    
    return errors;
  };

  const handleCellChange = (rowIndex: number, field: keyof CargaRow, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: value, errors: [] };
    setRows(newRows);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const lines = paste.split('\n').slice(0, 20); // Máximo 20 filas
    
    const newRows = [...rows];
    
    lines.forEach((line, lineIndex) => {
      if (lineIndex < 20 && line.trim()) {
        const cells = line.split('\t'); // Separar por tabulaciones
        if (cells.length >= 6) { // Mínimo campos requeridos
          newRows[lineIndex] = {
            origen: cells[0] || "",
            destino: cells[1] || "",
            tipo_carga: cells[2] || "",
            tipo_camion: cells[3] || "",
            fecha_carga_desde: cells[4] || "",
            tarifa: cells[5] || "",
            tipo_tarifa: cells[6] || "por_viaje",
            cantidad_cargas: cells[7] || "1",
            observaciones: cells[8] || "",
            errors: []
          };
        }
      }
    });
    
    setRows(newRows);
    toast({
      title: "Datos pegados",
      description: `Se procesaron ${lines.length} filas`,
    });
  };

  const validateAllRows = () => {
    const newRows = rows.map((row, index) => ({
      ...row,
      errors: validateRow(row, index)
    }));
    setRows(newRows);
    
    // Contar filas con datos
    const rowsWithData = newRows.filter(row => 
      row.origen.trim() || row.destino.trim() || row.tipo_carga.trim()
    );
    
    // Contar errores
    const totalErrors = newRows.reduce((sum, row) => sum + row.errors.length, 0);
    
    return { rowsWithData, totalErrors };
  };

  const handleSave = async () => {
    const { rowsWithData, totalErrors } = validateAllRows();
    
    if (rowsWithData.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay filas con datos para guardar",
        variant: "destructive",
      });
      return;
    }
    
    if (totalErrors > 0) {
      toast({
        title: "Errores encontrados",
        description: `Hay ${totalErrors} errores que deben corregirse antes de guardar`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error de autenticación",
          description: "Debe iniciar sesión para crear cargas",
          variant: "destructive",
        });
        return;
      }
      
      const cargasToInsert = rowsWithData.map(row => ({
        usuario_id: user.id,
        origen: row.origen.trim(),
        destino: row.destino.trim(),
        tipo_carga: row.tipo_carga.trim(),
        tipo_camion: row.tipo_camion.trim(),
        fecha_carga_desde: new Date(row.fecha_carga_desde).toISOString(),
        tarifa: parseFloat(row.tarifa),
        tipo_tarifa: row.tipo_tarifa,
        cantidad_cargas: parseInt(row.cantidad_cargas) || 1,
        observaciones: row.observaciones.trim() || null,
        estado: 'disponible'
      }));
      
      const { error } = await supabase
        .from("cargas")
        .insert(cargasToInsert);
      
      if (error) throw error;
      
      toast({
        title: "Cargas creadas exitosamente",
        description: `Se crearon ${cargasToInsert.length} cargas`,
      });
      
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error("Error creating bulk cargas:", error);
      toast({
        title: "Error",
        description: "No se pudieron crear las cargas: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "origen",
      "destino", 
      "tipo_carga",
      "tipo_camion",
      "fecha_carga_desde",
      "tarifa",
      "tipo_tarifa",
      "cantidad_cargas",
      "observaciones"
    ];
    
    const csvContent = headers.join('\t') + '\n' +
      'Buenos Aires, Argentina\tCórdoba, Argentina\tGeneral\tSemirremolque\t2024-01-15\t150000\tpor_viaje\t1\tCarga de ejemplo';
    
    const blob = new Blob([csvContent], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_cargas.tsv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (rows.length === 0) {
    initializeRows();
  }

  const rowsWithData = rows.filter(row => 
    row.origen.trim() || row.destino.trim() || row.tipo_carga.trim()
  ).length;
  
  const totalErrors = rows.reduce((sum, row) => sum + row.errors.length, 0);

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Carga Masiva de Cargas</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Descargar plantilla
          </Button>
          <Badge variant="outline">
            Filas con datos: {rowsWithData}/20
          </Badge>
          {totalErrors > 0 && (
            <Badge variant="destructive">
              Errores: {totalErrors}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted rounded-md text-sm">
          <p><strong>Instrucciones:</strong></p>
          <p>• Puede pegar datos desde Excel/Google Sheets (Ctrl+V en la tabla)</p>
          <p>• Máximo 20 filas por carga</p>
          <p>• Formato de fecha: YYYY-MM-DD (ej: 2024-01-15)</p>
          <p>• Tipo de tarifa: "por_viaje" o "por_tonelada"</p>
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <div 
            className="overflow-x-auto max-h-96"
            onPaste={handlePaste}
            tabIndex={0}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">#</TableHead>
                  <TableHead className="min-w-40">Origen*</TableHead>
                  <TableHead className="min-w-40">Destino*</TableHead>
                  <TableHead className="min-w-32">Tipo Carga*</TableHead>
                  <TableHead className="min-w-32">Tipo Camión*</TableHead>
                  <TableHead className="min-w-32">Fecha*</TableHead>
                  <TableHead className="min-w-24">Tarifa*</TableHead>
                  <TableHead className="min-w-32">Tipo Tarifa</TableHead>
                  <TableHead className="w-20">Cantidad</TableHead>
                  <TableHead className="min-w-40">Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index} className={row.errors.length > 0 ? "bg-red-50" : ""}>
                    <TableCell className="font-medium">
                      {index + 1}
                      {row.errors.length > 0 && (
                        <Badge variant="destructive" className="ml-1 text-xs">
                          {row.errors.length}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full p-1 border rounded text-sm"
                        value={row.origen}
                        onChange={(e) => handleCellChange(index, 'origen', e.target.value)}
                        placeholder="Ciudad, País"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full p-1 border rounded text-sm"
                        value={row.destino}
                        onChange={(e) => handleCellChange(index, 'destino', e.target.value)}
                        placeholder="Ciudad, País"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full p-1 border rounded text-sm"
                        value={row.tipo_carga}
                        onChange={(e) => handleCellChange(index, 'tipo_carga', e.target.value)}
                        placeholder="General, Refrigerada..."
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full p-1 border rounded text-sm"
                        value={row.tipo_camion}
                        onChange={(e) => handleCellChange(index, 'tipo_camion', e.target.value)}
                        placeholder="Semirremolque..."
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full p-1 border rounded text-sm"
                        type="date"
                        value={row.fecha_carga_desde}
                        onChange={(e) => handleCellChange(index, 'fecha_carga_desde', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full p-1 border rounded text-sm"
                        type="number"
                        value={row.tarifa}
                        onChange={(e) => handleCellChange(index, 'tarifa', e.target.value)}
                        placeholder="150000"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className="w-full p-1 border rounded text-sm"
                        value={row.tipo_tarifa}
                        onChange={(e) => handleCellChange(index, 'tipo_tarifa', e.target.value)}
                      >
                        <option value="por_viaje">Por viaje</option>
                        <option value="por_tonelada">Por tonelada</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full p-1 border rounded text-sm"
                        type="number"
                        value={row.cantidad_cargas}
                        onChange={(e) => handleCellChange(index, 'cantidad_cargas', e.target.value)}
                        min="1"
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full p-1 border rounded text-sm"
                        value={row.observaciones}
                        onChange={(e) => handleCellChange(index, 'observaciones', e.target.value)}
                        placeholder="Opcional"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {totalErrors > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <h4 className="font-medium text-red-800 mb-2">Errores encontrados:</h4>
            <div className="space-y-1">
              {rows.map((row, index) => 
                row.errors.map((error, errorIndex) => (
                  <p key={`${index}-${errorIndex}`} className="text-sm text-red-600">
                    Fila {index + 1}: {error}
                  </p>
                ))
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || rowsWithData === 0}>
            {loading && <Save className="h-4 w-4 mr-2 animate-spin" />}
            Guardar Cargas ({rowsWithData})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CargaMasivaForm;
