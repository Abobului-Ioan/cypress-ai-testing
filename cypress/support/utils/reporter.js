// support/utils/reporter.js - Clean reporting system without console spam
export class AIReporter {
  constructor() {
    this.testResults = [];
    this.sessionData = {
      startTime: Date.now(),
      framework: 'AI-Enhanced Cypress',
      version: '1.0.0'
    };
    this.aiMetrics = {
      totalOperations: 0,
      successfulOperations: 0,
      healingEvents: 0,
      visualTests: 0,
      learningEvents: 0
    };
  }

  /**
   * Record test completion
   */
  recordTest(testName, result, aiData = {}) {
    const testRecord = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: testName,
      status: result.status, // 'passed', 'failed', 'skipped'
      duration: result.duration || 0,
      timestamp: new Date().toISOString(),
      aiMetrics: {
        operationsUsed: aiData.operations || 0,
        healingAttempts: aiData.healing || 0,
        visualComparisons: aiData.visual || 0,
        confidenceScore: aiData.confidence || 0,
        strategiesUsed: aiData.strategies || []
      },
      performance: {
        elementFindTime: aiData.elementFindTime || 0,
        totalTime: result.duration || 0,
        cacheHitRate: aiData.cacheHitRate || 0
      },
      metadata: aiData.metadata || {}
    };

    this.testResults.push(testRecord);
    this.updateMetrics(testRecord);
    
    return testRecord.id;
  }

  /**
   * Record AI operation
   */
  recordOperation(type, selector, success, metadata = {}) {
    this.aiMetrics.totalOperations++;
    
    if (success) {
      this.aiMetrics.successfulOperations++;
    }
    
    switch (type) {
      case 'healing':
        this.aiMetrics.healingEvents++;
        break;
      case 'visual':
        this.aiMetrics.visualTests++;
        break;
      case 'learning':
        this.aiMetrics.learningEvents++;
        break;
    }
  }

  /**
   * Update overall metrics
   */
  updateMetrics(testRecord) {
    this.aiMetrics.totalOperations += testRecord.aiMetrics.operationsUsed;
    this.aiMetrics.healingEvents += testRecord.aiMetrics.healingAttempts;
    this.aiMetrics.visualTests += testRecord.aiMetrics.visualComparisons;
  }

  /**
   * Generate test suite summary
   */
  generateSuiteSummary(suiteName) {
    const suiteTests = this.testResults.filter(test => 
      test.name.includes(suiteName) || test.metadata.suite === suiteName
    );
    
    const passed = suiteTests.filter(test => test.status === 'passed').length;
    const failed = suiteTests.filter(test => test.status === 'failed').length;
    const total = suiteTests.length;
    
    return {
      suiteName,
      total,
      passed,
      failed,
      successRate: total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%',
      duration: suiteTests.reduce((sum, test) => sum + test.duration, 0),
      aiOperations: suiteTests.reduce((sum, test) => sum + test.aiMetrics.operationsUsed, 0),
      avgConfidence: this.calculateAverageConfidence(suiteTests)
    };
  }

  /**
   * Generate comprehensive report
   */
  generateReport(type = 'comprehensive') {
    const endTime = Date.now();
    const sessionDuration = endTime - this.sessionData.startTime;
    
    const report = {
      metadata: {
        reportType: type,
        generatedAt: new Date().toISOString(),
        sessionDuration: `${(sessionDuration / 1000).toFixed(1)}s`,
        framework: this.sessionData.framework,
        version: this.sessionData.version
      },
      summary: {
        totalTests: this.testResults.length,
        passedTests: this.testResults.filter(t => t.status === 'passed').length,
        failedTests: this.testResults.filter(t => t.status === 'failed').length,
        successRate: this.calculateSuccessRate(),
        totalDuration: this.testResults.reduce((sum, test) => sum + test.duration, 0)
      },
      aiMetrics: {
        ...this.aiMetrics,
        successRate: this.aiMetrics.totalOperations > 0 ? 
          ((this.aiMetrics.successfulOperations / this.aiMetrics.totalOperations) * 100).toFixed(1) + '%' : '0%',
        operationsPerTest: this.testResults.length > 0 ? 
          (this.aiMetrics.totalOperations / this.testResults.length).toFixed(1) : '0'
      },
      performance: this.calculatePerformanceMetrics(),
      capabilities: this.getCapabilitiesUsed(),
      insights: this.generateInsights()
    };

    if (type === 'detailed') {
      report.testDetails = this.testResults;
    }

    return report;
  }

  /**
   * Calculate performance metrics
   */
  calculatePerformanceMetrics() {
    if (this.testResults.length === 0) {
      return {
        avgTestDuration: 0,
        avgElementFindTime: 0,
        avgCacheHitRate: 0
      };
    }

    return {
      avgTestDuration: (this.testResults.reduce((sum, test) => sum + test.duration, 0) / this.testResults.length).toFixed(0) + 'ms',
      avgElementFindTime: (this.testResults.reduce((sum, test) => sum + test.performance.elementFindTime, 0) / this.testResults.length).toFixed(0) + 'ms',
      avgCacheHitRate: (this.testResults.reduce((sum, test) => sum + test.performance.cacheHitRate, 0) / this.testResults.length).toFixed(1) + '%'
    };
  }

  /**
   * Get capabilities that were used
   */
  getCapabilitiesUsed() {
    const capabilities = new Set();
    
    this.testResults.forEach(test => {
      test.aiMetrics.strategiesUsed.forEach(strategy => capabilities.add(strategy));
      
      if (test.aiMetrics.healingAttempts > 0) capabilities.add('self-healing');
      if (test.aiMetrics.visualComparisons > 0) capabilities.add('visual-testing');
      if (test.aiMetrics.operationsUsed > 0) capabilities.add('ai-enhanced-finding');
    });
    
    return Array.from(capabilities);
  }

  /**
   * Generate insights based on test data
   */
  generateInsights() {
    const insights = [];
    
    // Success rate insight
    const successRate = parseFloat(this.calculateSuccessRate());
    if (successRate >= 95) {
      insights.push('Excellent test reliability - 95%+ success rate achieved');
    } else if (successRate >= 85) {
      insights.push('Good test reliability - Consider optimizing failing tests');
    } else {
      insights.push('Test reliability needs attention - Review failing scenarios');
    }
    
    // AI operations insight
    if (this.aiMetrics.totalOperations > 0) {
      const aiSuccessRate = (this.aiMetrics.successfulOperations / this.aiMetrics.totalOperations) * 100;
      if (aiSuccessRate >= 90) {
        insights.push('AI operations performing excellently');
      } else {
        insights.push('AI operations may need optimization');
      }
    }
    
    // Healing insight
    if (this.aiMetrics.healingEvents > 0) {
      insights.push(`Self-healing activated ${this.aiMetrics.healingEvents} times - Adaptive testing working`);
    }
    
    // Visual testing insight
    if (this.aiMetrics.visualTests > 0) {
      insights.push(`Visual intelligence used in ${this.aiMetrics.visualTests} comparisons`);
    }
    
    return insights;
  }

  /**
   * Helper methods
   */
  calculateSuccessRate() {
    if (this.testResults.length === 0) return '0%';
    const passed = this.testResults.filter(t => t.status === 'passed').length;
    return ((passed / this.testResults.length) * 100).toFixed(1) + '%';
  }

  calculateAverageConfidence(tests) {
    if (tests.length === 0) return 0;
    const totalConfidence = tests.reduce((sum, test) => sum + test.aiMetrics.confidenceScore, 0);
    return (totalConfidence / tests.length).toFixed(3);
  }

  /**
   * Export report to different formats
   */
  exportReport(report, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(report, null, 2);
      
      case 'html':
        return this.generateHTMLReport(report);
      
      case 'summary':
        return this.generateTextSummary(report);
      
      default:
        return JSON.stringify(report, null, 2);
    }
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>AI Testing Framework Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; font-size: 0.9em; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        .insights { background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .insights h3 { color: #0066cc; margin-top: 0; }
        .insights ul { margin: 0; }
        .footer { text-align: center; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 AI Testing Framework Report</h1>
        <p>Generated: ${report.metadata.generatedAt}</p>
        <p>Session Duration: ${report.metadata.sessionDuration}</p>
    </div>
    
    <div class="metric-grid">
        <div class="metric-card">
            <div class="metric-value success">${report.summary.passedTests}/${report.summary.totalTests}</div>
            <div class="metric-label">Tests Passed</div>
        </div>
        <div class="metric-card">
            <div class="metric-value info">${report.summary.successRate}</div>
            <div class="metric-label">Success Rate</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${report.aiMetrics.totalOperations}</div>
            <div class="metric-label">AI Operations</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${report.aiMetrics.successRate}</div>
            <div class="metric-label">AI Success Rate</div>
        </div>
    </div>
    
    <div class="insights">
        <h3>📊 Key Insights</h3>
        <ul>
            ${report.insights.map(insight => `<li>${insight}</li>`).join('')}
        </ul>
    </div>
    
    <div class="insights">
        <h3>🎯 AI Capabilities Used</h3>
        <ul>
            ${report.capabilities.map(cap => `<li>${cap.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</li>`).join('')}
        </ul>
    </div>
    
    <div class="footer">
        <p>Generated by AI-Enhanced Cypress Testing Framework v${report.metadata.version}</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text summary
   */
  generateTextSummary(report) {
    return `
🤖 AI Testing Framework Report Summary
=====================================

📊 Test Results:
• Total Tests: ${report.summary.totalTests}
• Passed: ${report.summary.passedTests}
• Failed: ${report.summary.failedTests}
• Success Rate: ${report.summary.successRate}
• Duration: ${(report.summary.totalDuration / 1000).toFixed(1)}s

🧠 AI Metrics:
• AI Operations: ${report.aiMetrics.totalOperations}
• AI Success Rate: ${report.aiMetrics.successRate}
• Healing Events: ${report.aiMetrics.healingEvents}
• Visual Tests: ${report.aiMetrics.visualTests}

⚡ Performance:
• Avg Test Duration: ${report.performance.avgTestDuration}
• Avg Element Find: ${report.performance.avgElementFindTime}
• Cache Hit Rate: ${report.performance.avgCacheHitRate}

💡 Key Insights:
${report.insights.map(insight => `• ${insight}`).join('\n')}

🎯 Capabilities Used:
${report.capabilities.map(cap => `• ${cap.replace(/-/g, ' ')}`).join('\n')}
`;
  }

  /**
   * Reset for new session
   */
  reset() {
    this.testResults = [];
    this.aiMetrics = {
      totalOperations: 0,
      successfulOperations: 0,
      healingEvents: 0,
      visualTests: 0,
      learningEvents: 0
    };
    this.sessionData.startTime = Date.now();
  }
}

// Export singleton instance
export const aiReporter = new AIReporter();