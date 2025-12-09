/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Start timing an operation
   */
  start(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.record(label, duration);
    };
  }

  /**
   * Record a timing metric
   */
  record(label: string, duration: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
  }

  /**
   * Get average duration for a label
   */
  getAverage(label: string): number {
    const durations = this.metrics.get(label);
    if (!durations || durations.length === 0) return 0;
    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }

  /**
   * Get all metrics
   */
  getMetrics(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((durations, label) => {
      if (durations.length > 0) {
        result[label] = {
          count: durations.length,
          avg: durations.reduce((a, b) => a + b, 0) / durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations),
        };
      }
    });

    return result;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Log metrics to console
   */
  log(): void {
    console.table(this.getMetrics());
  }
}

/**
 * Singleton instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring function execution time
 */
export function measure(label?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricLabel = label || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const end = performanceMonitor.start(metricLabel);
      try {
        return await originalMethod.apply(this, args);
      } finally {
        end();
      }
    };

    return descriptor;
  };
}

/**
 * Utility to measure React component render time
 */
export function measureRender(componentName: string) {
  if (typeof window === 'undefined' || !window.performance) return;

  window.performance.mark(`${componentName}-start`);
  
  requestAnimationFrame(() => {
    window.performance.mark(`${componentName}-end`);
    window.performance.measure(
      componentName,
      `${componentName}-start`,
      `${componentName}-end`
    );
  });
}
