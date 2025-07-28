import { supabase } from '@/integrations/supabase/client';
import { queryMonitor } from '@/hooks/useQueryMonitor';

// Wrap Supabase client to add monitoring
export const createMonitoredSupabase = () => {
  const originalFrom = supabase.from.bind(supabase);
  
  supabase.from = (table: string) => {
    const builder = originalFrom(table);
    const originalSelect = builder.select.bind(builder);
    const originalInsert = builder.insert.bind(builder);
    const originalUpdate = builder.update.bind(builder);
    const originalDelete = builder.delete.bind(builder);
    const originalUpsert = builder.upsert.bind(builder);

    // Monitor SELECT queries
    builder.select = (...args: any[]) => {
      const startTime = Date.now();
      const logId = queryMonitor.addLog({
        query: `SELECT${args[0] ? ` ${args[0]}` : ' *'} FROM ${table}`,
        table,
        status: 'pending'
      });

      const query = originalSelect(...args);
      const originalThen = query.then.bind(query);
      
      query.then = (onResolve?: any, onReject?: any) => {
        return originalThen(
          (result: any) => {
            const duration = Date.now() - startTime;
            queryMonitor.updateLog(logId, {
              status: 'success',
              duration,
              result: { count: result.data?.length || 0, hasError: !!result.error }
            });
            return onResolve ? onResolve(result) : result;
          },
          (error: any) => {
            const duration = Date.now() - startTime;
            queryMonitor.updateLog(logId, {
              status: 'error',
              duration,
              error: error.message
            });
            return onReject ? onReject(error) : Promise.reject(error);
          }
        );
      };

      return query;
    };

    // Monitor INSERT queries
    builder.insert = (values: any) => {
      const startTime = Date.now();
      const logId = queryMonitor.addLog({
        query: `INSERT INTO ${table}`,
        table,
        status: 'pending'
      });

      const query = originalInsert(values);
      const originalThen = query.then.bind(query);
      
      query.then = (onResolve?: any, onReject?: any) => {
        return originalThen(
          (result: any) => {
            const duration = Date.now() - startTime;
            queryMonitor.updateLog(logId, {
              status: 'success',
              duration,
              result: { inserted: Array.isArray(values) ? values.length : 1 }
            });
            return onResolve ? onResolve(result) : result;
          },
          (error: any) => {
            const duration = Date.now() - startTime;
            queryMonitor.updateLog(logId, {
              status: 'error',
              duration,
              error: error.message
            });
            return onReject ? onReject(error) : Promise.reject(error);
          }
        );
      };

      return query;
    };

    // Monitor UPDATE queries
    builder.update = (values: any) => {
      const startTime = Date.now();
      const logId = queryMonitor.addLog({
        query: `UPDATE ${table}`,
        table,
        status: 'pending'
      });

      const query = originalUpdate(values);
      const originalThen = query.then.bind(query);
      
      query.then = (onResolve?: any, onReject?: any) => {
        return originalThen(
          (result: any) => {
            const duration = Date.now() - startTime;
            queryMonitor.updateLog(logId, {
              status: 'success',
              duration
            });
            return onResolve ? onResolve(result) : result;
          },
          (error: any) => {
            const duration = Date.now() - startTime;
            queryMonitor.updateLog(logId, {
              status: 'error',
              duration,
              error: error.message
            });
            return onReject ? onReject(error) : Promise.reject(error);
          }
        );
      };

      return query;
    };

    // Monitor DELETE queries
    builder.delete = () => {
      const startTime = Date.now();
      const logId = queryMonitor.addLog({
        query: `DELETE FROM ${table}`,
        table,
        status: 'pending'
      });

      const query = originalDelete();
      const originalThen = query.then.bind(query);
      
      query.then = (onResolve?: any, onReject?: any) => {
        return originalThen(
          (result: any) => {
            const duration = Date.now() - startTime;
            queryMonitor.updateLog(logId, {
              status: 'success',
              duration
            });
            return onResolve ? onResolve(result) : result;
          },
          (error: any) => {
            const duration = Date.now() - startTime;
            queryMonitor.updateLog(logId, {
              status: 'error',
              duration,
              error: error.message
            });
            return onReject ? onReject(error) : Promise.reject(error);
          }
        );
      };

      return query;
    };

    return builder;
  };

  return supabase;
};

// Initialize monitoring
createMonitoredSupabase();