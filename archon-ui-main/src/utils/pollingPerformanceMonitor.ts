/**
 * Performance monitoring utility to track CPU usage of polling operations
 * This helps validate the impact of our optimization changes
 */

interface PollingMetrics {
  operationName: string;
  intervalMs: number;
  startTime: number;
  pollCount: number;
  lastPollTime: number;
  isActive: boolean;
}

class PollingPerformanceMonitor {
  private metrics: Map<string, PollingMetrics> = new Map();
  private isMonitoring = false;

  startMonitoring(operationName: string, intervalMs: number) {
    this.metrics.set(operationName, {
      operationName,
      intervalMs,
      startTime: Date.now(),
      pollCount: 0,
      lastPollTime: Date.now(),
      isActive: true,
    });

    if (!this.isMonitoring) {
      this.isMonitoring = true;
      this.startPerformanceLogging();
    }
  }

  recordPoll(operationName: string) {
    const metric = this.metrics.get(operationName);
    if (metric) {
      metric.pollCount++;
      metric.lastPollTime = Date.now();
    }
  }

  stopMonitoring(operationName: string) {
    const metric = this.metrics.get(operationName);
    if (metric) {
      metric.isActive = false;
    }
  }

  getMetricsSummary() {
    const now = Date.now();
    const summary = Array.from(this.metrics.values()).map(metric => {
      const duration = now - metric.startTime;
      const actualFrequency = metric.pollCount > 0 ? duration / metric.pollCount : 0;
      const efficiencyRatio = actualFrequency / metric.intervalMs;

      return {
        operation: metric.operationName,
        configuredInterval: metric.intervalMs,
        actualInterval: actualFrequency,
        pollCount: metric.pollCount,
        duration: duration,
        efficiencyRatio: efficiencyRatio,
        cpuSavings: Math.max(0, (1 - (1 / efficiencyRatio)) * 100),
        isActive: metric.isActive,
      };
    });

    return summary.filter(s => s.pollCount > 0);
  }

  private startPerformanceLogging() {
    // Log metrics every 30 seconds
    const logInterval = setInterval(() => {
      const summary = this.getMetricsSummary();
      const activeOperations = summary.filter(s => s.isActive);
      
      if (activeOperations.length > 0) {
        console.group('🔍 Polling Performance Metrics');
        
        activeOperations.forEach(metric => {
          const cpuSavingsText = metric.cpuSavings > 0 
            ? `📉 ${metric.cpuSavings.toFixed(1)}% CPU savings vs 1s polling`
            : '⚡ High frequency polling';
            
          console.log(
            `${metric.operation}: ${metric.actualInterval.toFixed(0)}ms avg interval ` +
            `(${metric.pollCount} polls) - ${cpuSavingsText}`
          );
        });
        
        const totalCpuSavings = activeOperations
          .reduce((sum, m) => sum + m.cpuSavings, 0) / activeOperations.length;
        
        console.log(`🎯 Overall CPU efficiency improvement: ${totalCpuSavings.toFixed(1)}%`);
        console.groupEnd();
      }

      // Stop monitoring if no active operations
      if (activeOperations.length === 0) {
        clearInterval(logInterval);
        this.isMonitoring = false;
      }
    }, 30000);
  }
}

// Global instance for use across the application
export const pollingMonitor = new PollingPerformanceMonitor();

// Hook to easily integrate monitoring into query hooks
export function usePollingMonitor(operationName: string, intervalMs: number, isActive: boolean) {
  const startTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (isActive && !startTimeRef.current) {
      startTimeRef.current = Date.now();
      pollingMonitor.startMonitoring(operationName, intervalMs);
    } else if (!isActive && startTimeRef.current) {
      pollingMonitor.stopMonitoring(operationName);
      startTimeRef.current = null;
    }

    return () => {
      if (startTimeRef.current) {
        pollingMonitor.stopMonitoring(operationName);
        startTimeRef.current = null;
      }
    };
  }, [operationName, intervalMs, isActive]);

  const recordPoll = React.useCallback(() => {
    if (isActive) {
      pollingMonitor.recordPoll(operationName);
    }
  }, [operationName, isActive]);

  return { recordPoll };
}