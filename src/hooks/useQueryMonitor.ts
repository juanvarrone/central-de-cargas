import { useState, useEffect } from 'react';

export interface QueryLog {
  id: string;
  timestamp: Date;
  query: string;
  table: string;
  status: 'pending' | 'success' | 'error';
  duration?: number;
  error?: string;
  result?: any;
}

class QueryMonitor {
  private logs: QueryLog[] = [];
  private listeners: ((logs: QueryLog[]) => void)[] = [];
  private static instance: QueryMonitor;

  static getInstance() {
    if (!QueryMonitor.instance) {
      QueryMonitor.instance = new QueryMonitor();
    }
    return QueryMonitor.instance;
  }

  addLog(log: Omit<QueryLog, 'id' | 'timestamp'>) {
    const newLog: QueryLog = {
      ...log,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };
    
    this.logs.unshift(newLog);
    
    // Keep only last 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }
    
    this.notifyListeners();
    return newLog.id;
  }

  updateLog(id: string, updates: Partial<QueryLog>) {
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

  subscribe(listener: (logs: QueryLog[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }
}

export const useQueryMonitor = () => {
  const [logs, setLogs] = useState<QueryLog[]>([]);
  const monitor = QueryMonitor.getInstance();

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

export const queryMonitor = QueryMonitor.getInstance();
