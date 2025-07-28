import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSubmissionMonitor, SubmissionLog } from "@/hooks/useSubmissionMonitor";
import { AlertCircle, CheckCircle, Clock, Truck, Package, User, MapPin, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const SubmissionMonitorPanel = () => {
  const { logs, clearLogs } = useSubmissionMonitor();
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const getStatusIcon = (status: SubmissionLog['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: SubmissionLog['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: SubmissionLog['type']) => {
    return type === 'cargo' ? <Package className="h-4 w-4" /> : <Truck className="h-4 w-4" />;
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    }) + '.' + timestamp.getMilliseconds().toString().padStart(3, '0');
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    return `${duration}ms`;
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Monitor de Envíos
            </CardTitle>
            <CardDescription>
              Logs detallados de validación y envío de cargas y camiones
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3">
              {logs.length} registros
            </Badge>
            <Button 
              onClick={clearLogs} 
              variant="outline" 
              size="sm"
              disabled={logs.length === 0}
            >
              Limpiar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay registros de envíos aún
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <Collapsible key={log.id}>
                  <CollapsibleTrigger 
                    onClick={() => toggleLogExpansion(log.id)}
                    className="w-full"
                  >
                    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${getStatusColor(log.status)}`}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        {getTypeIcon(log.type)}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <span className="capitalize">{log.type}</span>
                          <span>•</span>
                          <span className="capitalize">{log.operation}</span>
                          {log.field && (
                            <>
                              <span>•</span>
                              <span className="text-muted-foreground">{log.field}</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {log.message}
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{formatTime(log.timestamp)}</div>
                        {log.duration && (
                          <div className="text-xs">{formatDuration(log.duration)}</div>
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="ml-8 mt-2 p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-2 text-sm">
                        {log.userId && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span className="font-medium">Usuario:</span>
                            <span className="font-mono text-xs">{log.userId}</span>
                          </div>
                        )}
                        
                        {log.error && (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-3 w-3 text-red-500 mt-0.5" />
                            <div>
                              <span className="font-medium text-red-700">Error:</span>
                              <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">{log.error}</pre>
                            </div>
                          </div>
                        )}
                        
                        {log.value && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium">Datos:</span>
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-32">
                              {typeof log.value === 'object' ? JSON.stringify(log.value, null, 2) : String(log.value)}
                            </pre>
                          </div>
                        )}
                        
                        {log.validationDetails && log.validationDetails.length > 0 && (
                          <div>
                            <span className="font-medium">Detalles de Validación:</span>
                            <div className="mt-1 space-y-1">
                              {log.validationDetails.map((detail, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                  {detail.isValid ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                  )}
                                  <span className="font-medium">{detail.field}:</span>
                                  <span className={detail.isValid ? 'text-green-700' : 'text-red-700'}>
                                    {detail.isValid ? 'VÁLIDO' : detail.errorMessage || 'INVÁLIDO'}
                                  </span>
                                  <span className="text-muted-foreground">
                                    ({typeof detail.value === 'object' ? JSON.stringify(detail.value) : String(detail.value)})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SubmissionMonitorPanel;