// support/utils/performance.js - Performance monitoring and optimization utilities
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      operations: new Map(),
      timings: [],
      memory: {
        samples: [],
        peak: 0,
        current: 0
      },
      network: {
        requests: [],
        totalTime: 0,
        averageTime: 0
      },
      ai: {
        operations: [],
        learning: [],
        visual: []
      }
    };
    
    this.thresholds = {
      slowOperation: 1000, // ms
      memoryWarning: 50 * 1024 * 1024, // 50MB
      memoryDanger: 100 * 1024 * 1024, // 100MB
      networkTimeout: 5000 // ms
    };
    
    this.monitoring = {
      active: false,
      startTime: null,
      interval: null
    };
    
    this.alerts = [];
  }

  /**
   * Start performance monitoring
   */
  start() {
    if (this.monitoring.active) return;
    
    this.monitoring.active = true;
    this.monitoring.startTime = Date.now();
    
    // Setup monitoring systems
    this.setupMemoryMonitoring();
    this.setupPerformanceObservers();
    this.startPeriodicMonitoring();
    
    console.log('📊 Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stop() {
    if (!this.monitoring.active) return;
    
    this.monitoring.active = false;
    
    if (this.monitoring.interval) {
      clearInterval(this.monitoring.interval);
    }
    
    console.log('📊 Performance monitoring stopped');
  }

  /**
   * Setup memory monitoring
   */
  setupMemoryMonitoring() {
    if (typeof window === 'undefined' || !window.performance?.memory) {
      console.warn('Memory monitoring not available');
      return;
    }
    
    setInterval(() => {
      if (!this.monitoring.active) return;
      
      const memory = window.performance.memory;
      const sample = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
      
      this.metrics.memory.samples.push(sample);
      this.metrics.memory.current = sample.used;
      this.metrics.memory.peak = Math.max(this.metrics.memory.peak, sample.used);
      
      // Keep only last 100 samples
      if (this.metrics.memory.samples.length > 100) {
        this.metrics.memory.samples = this.metrics.memory.samples.slice(-100);
      }
      
      // Check for memory warnings
      this.checkMemoryThresholds(sample);
      
    }, 5000); // Every 5 seconds
  }

  /**
   * Setup performance observers
   */
  setupPerformanceObservers() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      console.warn('PerformanceObserver not available');
      return;
    }
    
    try {
      // Measure observer
      const measureObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPerformanceEntry(entry);
        }
      });
      
      measureObserver.observe({ entryTypes: ['measure'] });
      
      // Navigation observer
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordNavigationTiming(entry);
        }
      });
      
      navigationObserver.observe({ entryTypes: ['navigation'] });
      
    } catch (error) {
      console.warn('Failed to setup performance observers:', error);
    }
  }

  /**
   * Start periodic monitoring tasks
   */
  startPeriodicMonitoring() {
    this.monitoring.interval = setInterval(() => {
      if (!this.monitoring.active) return;
      
      this.analyzePerformance();
      this.cleanupOldData();
      
    }, 10000); // Every 10 seconds
  }

  /**
   * Record operation performance
   */
  recordOperation(name, duration, metadata = {}) {
    if (!this.metrics.operations.has(name)) {
      this.metrics.operations.set(name, []);
    }
    
    const operations = this.metrics.operations.get(name);
    operations.push({
      duration,
      timestamp: Date.now(),
      metadata
    });
    
    // Keep only last 100 operations per type
    if (operations.length > 100) {
      operations.splice(0, operations.length - 100);
    }
    
    // Check for slow operations
    if (duration > this.thresholds.slowOperation) {
      this.addAlert('operation', 'warning', 
        `Slow operation: ${name} took ${duration}ms`);
    }
  }

  /**
   * Record AI operation performance
   */
  recordAIOperation(operation, data) {
    const record = {
      operation,
      duration: data.duration || 0,
      success: data.success !== false,
      timestamp: Date.now(),
      metadata: data
    };
    
    this.metrics.ai.operations.push(record);
    
    // Keep only last 50 AI operations
    if (this.metrics.ai.operations.length > 50) {
      this.metrics.ai.operations = this.metrics.ai.operations.slice(-50);
    }
    
    // Check for slow AI operations
    if (record.duration > 2000) {
      this.addAlert('ai', 'warning', 
        `Slow AI operation: ${operation} - ${record.duration}ms`);
    }
  }

  /**
   * Record performance entry
   */
  recordPerformanceEntry(entry) {
    this.metrics.timings.push({
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime,
      entryType: entry.entryType,
      timestamp: Date.now()
    });
    
    // Keep only last 200 entries
    if (this.metrics.timings.length > 200) {
      this.metrics.timings = this.metrics.timings.slice(-200);
    }
  }

  /**
   * Record navigation timing
   */
  recordNavigationTiming(entry) {
    const timing = {
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive: entry.domInteractive - entry.fetchStart,
      domComplete: entry.domComplete - entry.fetchStart,
      connectTime: entry.connectEnd - entry.connectStart,
      dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
      timestamp: Date.now()
    };
    
    this.recordOperation('page-navigation', timing.loadComplete, timing);
    
    if (timing.loadComplete > 3000) {
      this.addAlert('navigation', 'warning', 
        `Slow page load: ${timing.loadComplete}ms`);
    }
  }

  /**
   * Check memory thresholds
   */
  checkMemoryThresholds(sample) {
    if (sample.used > this.thresholds.memoryDanger) {
      this.addAlert('memory', 'error', 
        `Critical memory usage: ${(sample.used / 1024 / 1024).toFixed(2)}MB`);
    } else if (sample.used > this.thresholds.memoryWarning) {
      this.addAlert('memory', 'warning', 
        `High memory usage: ${(sample.used / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  /**
   * Add performance alert
   */
  addAlert(category, severity, message) {
    const alert = {
      id: Date.now() + Math.random(),
      category,
      severity,
      message,
      timestamp: Date.now()
    };
    
    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
    
    // Log critical alerts
    if (severity === 'error') {
      console.error(`🚨 Performance Alert: ${message}`);
    } else if (severity === 'warning') {
      console.warn(`⚠️ Performance Warning: ${message}`);
    }
  }

  /**
   * Analyze current performance
   */
  analyzePerformance() {
    const analysis = {
      timestamp: Date.now(),
      memory: this.analyzeMemory(),
      operations: this.analyzeOperations(),
      ai: this.analyzeAI(),
      overall: this.calculateOverallScore()
    };
    
    return analysis;
  }

  /**
   * Analyze memory performance
   */
  analyzeMemory() {
    if (this.metrics.memory.samples.length === 0) {
      return { status: 'no-data' };
    }
    
    const latest = this.metrics.memory.samples[this.metrics.memory.samples.length - 1];
    const usagePercent = (latest.used / latest.limit) * 100;
    
    let status = 'good';
    if (usagePercent > 80) status = 'critical';
    else if (usagePercent > 60) status = 'warning';
    
    // Check for memory leaks
    const trend = this.calculateMemoryTrend();
    
    return {
      status,
      current: this.formatBytes(latest.used),
      peak: this.formatBytes(this.metrics.memory.peak),
      usagePercent: usagePercent.toFixed(2) + '%',
      trend,
      samples: this.metrics.memory.samples.length
    };
  }

  /**
   * Analyze operations performance
   */
  analyzeOperations() {
    const analysis = {};
    
    this.metrics.operations.forEach((operations, name) => {
      if (operations.length === 0) return;
      
      const durations = operations.map(op => op.duration);
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      
      analysis[name] = {
        count: operations.length,
        avgDuration: avgDuration.toFixed(2) + 'ms',
        maxDuration: maxDuration + 'ms',
        minDuration: minDuration + 'ms',
        status: avgDuration > this.thresholds.slowOperation ? 'slow' : 'good'
      };
    });
    
    return analysis;
  }

  /**
   * Analyze AI operations performance
   */
  analyzeAI() {
    if (this.metrics.ai.operations.length === 0) {
      return { status: 'no-data' };
    }
    
    const operations = this.metrics.ai.operations;
    const successfulOps = operations.filter(op => op.success);
    const avgDuration = operations.reduce((sum, op) => sum + op.duration, 0) / operations.length;
    
    return {
      totalOperations: operations.length,
      successRate: ((successfulOps.length / operations.length) * 100).toFixed(1) + '%',
      avgDuration: avgDuration.toFixed(2) + 'ms',
      status: avgDuration > 1000 ? 'slow' : 'good'
    };
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallScore() {
    let score = 100;
    const factors = [];
    
    // Memory factor
    const memoryAnalysis = this.analyzeMemory();
    if (memoryAnalysis.status === 'critical') {
      score -= 30;
      factors.push('Critical memory usage');
    } else if (memoryAnalysis.status === 'warning') {
      score -= 15;
      factors.push('High memory usage');
    }
    
    // Operations factor
    const operationsAnalysis = this.analyzeOperations();
    const slowOperations = Object.values(operationsAnalysis).filter(op => op.status === 'slow').length;
    if (slowOperations > 0) {
      score -= slowOperations * 10;
      factors.push(`${slowOperations} slow operations`);
    }
    
    // AI factor
    const aiAnalysis = this.analyzeAI();
    if (aiAnalysis.status === 'slow') {
      score -= 20;
      factors.push('Slow AI operations');
    }
    
    // Alerts factor
    const recentAlerts = this.alerts.filter(alert => 
      Date.now() - alert.timestamp < 60000 // Last minute
    );
    score -= recentAlerts.length * 5;
    
    return {
      score: Math.max(0, score),
      status: score > 80 ? 'excellent' : score > 60 ? 'good' : score > 40 ? 'fair' : 'poor',
      factors: factors.length > 0 ? factors : ['No performance issues detected']
    };
  }

  /**
   * Calculate memory trend
   */
  calculateMemoryTrend() {
    if (this.metrics.memory.samples.length < 10) return 'insufficient-data';
    
    const recent = this.metrics.memory.samples.slice(-5);
    const older = this.metrics.memory.samples.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, s) => sum + s.used, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.used, 0) / older.length;
    
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (changePercent > 10) return 'increasing';
    if (changePercent < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Clean up old data
   */
  cleanupOldData() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    // Clean timings
    this.metrics.timings = this.metrics.timings.filter(t => t.timestamp > cutoff);
    
    // Clean alerts
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
    
    // Clean AI operations
    this.metrics.ai.operations = this.metrics.ai.operations.filter(op => op.timestamp > cutoff);
  }

  /**
   * Get comprehensive performance report
   */
  getReport() {
    return {
      timestamp: new Date().toISOString(),
      monitoring: {
        active: this.monitoring.active,
        duration: this.monitoring.startTime ? Date.now() - this.monitoring.startTime : 0
      },
      analysis: this.analyzePerformance(),
      alerts: this.alerts.slice(-10), // Last 10 alerts
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const analysis = this.analyzePerformance();
    
    // Memory recommendations
    if (analysis.memory.status === 'critical') {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'Critical memory usage detected - implement memory cleanup',
        action: 'Optimize memory usage and dispose unused objects'
      });
    } else if (analysis.memory.status === 'warning') {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: 'High memory usage - monitor for potential leaks',
        action: 'Review memory usage patterns'
      });
    }
    
    // Operations recommendations
    const slowOps = Object.entries(analysis.operations).filter(([_, data]) => data.status === 'slow');
    if (slowOps.length > 0) {
      recommendations.push({
        type: 'operations',
        priority: 'medium',
        message: `${slowOps.length} slow operations detected`,
        action: `Optimize: ${slowOps.map(([name]) => name).join(', ')}`
      });
    }
    
    // AI recommendations
    if (analysis.ai.status === 'slow') {
      recommendations.push({
        type: 'ai',
        priority: 'medium',
        message: 'AI operations are running slowly',
        action: 'Review AI algorithms and caching strategies'
      });
    }
    
    return recommendations;
  }

  /**
   * Reset performance data
   */
  reset() {
    this.metrics = {
      operations: new Map(),
      timings: [],
      memory: { samples: [], peak: 0, current: 0 },
      network: { requests: [], totalTime: 0, averageTime: 0 },
      ai: { operations: [], learning: [], visual: [] }
    };
    
    this.alerts = [];
    this.monitoring.startTime = Date.now();
    
    console.log('🔄 Performance metrics reset');
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();