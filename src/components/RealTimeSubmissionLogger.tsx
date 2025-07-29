import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSubmissionMonitor, SubmissionLog } from "@/hooks/useSubmissionMonitor";
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Package, Truck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface RealTimeSubmissionLoggerProps {
  isActive?: boolean;
  height?: string;
}

const RealTimeSubmissionLogger = ({ isActive = false, height = "h-[300px]" }: RealTimeSubmissionLoggerProps) => {
  const { logs, clearLogs } = useSubmissionMonitor();
  const [isVisible, setIsVisible] = useState(false);
  
  // Show logger when there are logs or when explicitly activated
  useEffect(() => {
    if (logs.length > 0 || isActive) {
      setIsVisible(true);
    }
  }, [logs.length, isActive]);

  const getStatusIcon = (status: SubmissionLog['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: SubmissionLog['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: SubmissionLog['type']) => {
    return type === 'cargo' ? <Package className="h-3 w-3" /> : <Truck className="h-3 w-3" />;
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    }) + '.' + timestamp.getMilliseconds().toString().padStart(3, '0');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="mt-4 border-2 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Monitor en Tiempo Real
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {logs.length} evento{logs.length !== 1 ? 's' : ''}
            </Badge>
            {logs.length > 0 && (
              <Button 
                onClick={clearLogs} 
                variant="outline" 
                size="sm"
                className="h-6 px-2 text-xs"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className={height}>
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-4 text-sm">
              <p>Presiona "Publicar Carga" para ver el proceso en tiempo real</p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.slice().reverse().map((log) => (
                <div 
                  key={log.id} 
                  className={`flex items-start gap-2 p-2 rounded border text-xs ${getStatusColor(log.status)}`}
                >
                  <div className="flex items-center gap-1 pt-0.5">
                    {getStatusIcon(log.status)}
                    {getTypeIcon(log.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 font-medium">
                      <span className="capitalize">{log.operation}</span>
                      {log.field && (
                        <>
                          <span>•</span>
                          <span className="text-muted-foreground">{log.field}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs mt-0.5 break-words">
                      {log.message}
                    </div>
                    
                    {log.error && (
                      <div className="text-xs mt-1 p-1 bg-red-100 border border-red-200 rounded font-mono">
                        <span className="font-semibold">Error:</span> {log.error}
                      </div>
                    )}
                    
                    {log.value && (
                      <div className="text-xs mt-1 p-1 bg-gray-100 border border-gray-200 rounded font-mono max-h-20 overflow-auto">
                        <span className="font-semibold">Datos:</span>{' '}
                        {typeof log.value === 'object' ? JSON.stringify(log.value, null, 1) : String(log.value)}
                      </div>
                    )}
                    
                    {log.validationDetails && log.validationDetails.length > 0 && (
                      <div className="mt-1">
                        <div className="text-xs font-semibold mb-1">Validaciones:</div>
                        <div className="space-y-0.5">
                          {log.validationDetails.map((detail, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs">
                              {detail.isValid ? (
                                <CheckCircle className="h-2 w-2 text-green-500" />
                              ) : (
                                <AlertCircle className="h-2 w-2 text-red-500" />
                              )}
                              <span className="font-medium">{detail.field}:</span>
                              <span className={detail.isValid ? 'text-green-700' : 'text-red-700'}>
                                {detail.isValid ? 'OK' : detail.errorMessage || 'ERROR'}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                ({typeof detail.value === 'object' ? JSON.stringify(detail.value) : String(detail.value)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-right whitespace-nowrap">
                    {formatTime(log.timestamp)}
                    {log.duration && (
                      <div className="text-xs">{log.duration}ms</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealTimeSubmissionLogger;