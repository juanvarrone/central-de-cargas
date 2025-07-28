import React from 'react';
import { useQueryMonitor, QueryLog } from '@/hooks/useQueryMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Database, AlertCircle, CheckCircle, Loader, Trash2 } from 'lucide-react';

const QueryMonitorPanel = () => {
  const { logs, clearLogs } = useQueryMonitor();

  const getStatusIcon = (status: QueryLog['status']) => {
    switch (status) {
      case 'pending':
        return <Loader className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: QueryLog['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    return `${duration}ms`;
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Monitor de Consultas DB
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {logs.length} consultas
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearLogs}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full pr-4">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No hay consultas registradas aún
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(log.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(log.status)} text-white`}
                      >
                        {log.table}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(log.timestamp)}
                      </span>
                      {log.duration && (
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(log.duration)}
                        </span>
                      )}
                    </div>
                    
                    <code className="text-xs bg-muted p-1 rounded block truncate">
                      {log.query}
                    </code>
                    
                    {log.error && (
                      <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
                        Error: {log.error}
                      </div>
                    )}
                    
                    {log.result && log.status === 'success' && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        {log.result.count !== undefined && `${log.result.count} registros`}
                        {log.result.inserted !== undefined && `${log.result.inserted} insertados`}
                      </div>
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

export default QueryMonitorPanel;