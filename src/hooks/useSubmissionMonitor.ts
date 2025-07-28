import { useState, useEffect } from 'react';

export interface SubmissionLog {
  id: string;
  timestamp: Date;
  type: 'cargo' | 'truck';
  operation: 'validation' | 'submission' | 'error';
  status: 'pending' | 'success' | 'error' | 'warning';
  field?: string;
  value?: any;
  error?: string;
  message: string;
  userId?: string;
  duration?: number;
  validationDetails?: {
    field: string;
    value: any;
    isValid: boolean;
    errorMessage?: string;
  }[];
}

class SubmissionMonitor {
  private logs: SubmissionLog[] = [];
  private listeners: ((logs: SubmissionLog[]) => void)[] = [];
  private static instance: SubmissionMonitor;

  static getInstance() {
    if (!SubmissionMonitor.instance) {
      SubmissionMonitor.instance = new SubmissionMonitor();
    }
    return SubmissionMonitor.instance;
  }

  addLog(log: Omit<SubmissionLog, 'id' | 'timestamp'>) {
    const newLog: SubmissionLog = {
      ...log,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };
    
    this.logs.unshift(newLog);
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }
    
    this.notifyListeners();
    console.log(`[SubmissionMonitor] ${log.type.toUpperCase()} ${log.operation}:`, log.message, log);
    return newLog.id;
  }

  updateLog(id: string, updates: Partial<SubmissionLog>) {
    const logIndex = this.logs.findIndex(log => log.id === id);
    if (logIndex !== -1) {
      this.logs[logIndex] = { ...this.logs[logIndex], ...updates };
      this.notifyListeners();
    }
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  subscribe(listener: (logs: SubmissionLog[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  // Helper methods for common logging scenarios
  logValidation(type: 'cargo' | 'truck', field: string, value: any, isValid: boolean, errorMessage?: string) {
    this.addLog({
      type,
      operation: 'validation',
      status: isValid ? 'success' : 'error',
      field,
      value,
      error: errorMessage,
      message: `Validación ${field}: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'} - ${value}`
    });
  }

  logFieldProcessing(type: 'cargo' | 'truck', field: string, originalValue: any, processedValue: any, message?: string) {
    this.addLog({
      type,
      operation: 'validation',
      status: 'success',
      field,
      value: { original: originalValue, processed: processedValue },
      message: message || `Campo ${field} procesado: ${originalValue} → ${processedValue}`
    });
  }

  logConnectionAttempt(type: 'cargo' | 'truck', message: string) {
    const logId = this.addLog({
      type,
      operation: 'submission',
      status: 'pending',
      message: `Conectando: ${message}`
    });
    return logId;
  }

  logConnectionSuccess(logId: string, duration: number) {
    this.updateLog(logId, {
      status: 'success',
      duration,
      message: `Conexión exitosa (${duration}ms)`
    });
  }

  logConnectionError(logId: string, error: string, duration?: number) {
    this.updateLog(logId, {
      status: 'error',
      error,
      duration,
      message: `Error de conexión: ${error}`
    });
  }

  logSubmissionStart(type: 'cargo' | 'truck', userId: string, data: any) {
    return this.addLog({
      type,
      operation: 'submission',
      status: 'pending',
      userId,
      value: data,
      message: `Iniciando envío de ${type} para usuario ${userId}`
    });
  }

  logSubmissionSuccess(logId: string, duration: number, message?: string) {
    this.updateLog(logId, {
      status: 'success',
      duration,
      message: message || `Envío completado exitosamente (${duration}ms)`
    });
  }

  logSubmissionError(logId: string, error: string, duration?: number) {
    this.updateLog(logId, {
      status: 'error',
      error,
      duration,
      message: `Error en envío: ${error}`
    });
  }

  logAuthCheck(type: 'cargo' | 'truck', userId?: string, hasPermission?: boolean) {
    this.addLog({
      type,
      operation: 'validation',
      status: hasPermission ? 'success' : 'error',
      userId,
      message: `Verificación de autenticación: ${hasPermission ? 'Usuario autenticado' : 'Usuario no autenticado'}`
    });
  }

  logGeocoding(type: 'cargo' | 'truck', address: string, success: boolean, coordinates?: { lat: number; lng: number }, error?: string) {
    this.addLog({
      type,
      operation: 'validation',
      status: success ? 'success' : 'error',
      field: 'geocoding',
      value: { address, coordinates },
      error,
      message: `Geocodificación ${address}: ${success ? `ÉXITO (${coordinates?.lat}, ${coordinates?.lng})` : `ERROR - ${error}`}`
    });
  }

  logBulkValidation(type: 'cargo' | 'truck', validationResults: { field: string; value: any; isValid: boolean; errorMessage?: string }[]) {
    const failedValidations = validationResults.filter(v => !v.isValid);
    const hasErrors = failedValidations.length > 0;
    
    this.addLog({
      type,
      operation: 'validation',
      status: hasErrors ? 'error' : 'success',
      validationDetails: validationResults,
      message: `Validación masiva: ${validationResults.length - failedValidations.length}/${validationResults.length} campos válidos`
    });

    // Log individual failed validations
    failedValidations.forEach(validation => {
      this.logValidation(type, validation.field, validation.value, false, validation.errorMessage);
    });
  }
}

export const useSubmissionMonitor = () => {
  const [logs, setLogs] = useState<SubmissionLog[]>([]);
  const monitor = SubmissionMonitor.getInstance();

  useEffect(() => {
    setLogs(monitor.getLogs());
    return monitor.subscribe(setLogs);
  }, [monitor]);

  return {
    logs,
    clearLogs: () => monitor.clearLogs(),
    monitor
  };
};

export const submissionMonitor = SubmissionMonitor.getInstance();
