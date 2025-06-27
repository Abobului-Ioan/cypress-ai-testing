// cypress.config.js - FIXED: Single live HTML report with real-time updates
import { defineConfig } from 'cypress';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5500/',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 15000,
    video: true,
    screenshotOnRunFailure: true,
    
    env: {
      visualThreshold: 0.1,
      maxSelectorAttempts: 5,
      selectorConfidenceThreshold: 0.8,
      enableAILogging: true,
      enablePerformanceMonitoring: true,
      cacheSize: 100,
      memoryLimit: '100MB',
      colorTolerance: 0.3,
      layoutTolerance: 0.2,
      ignoreDynamicContent: true
    },
    
    setupNodeEvents(on, config) {
      const reportsDir = path.join(process.cwd(), 'cypress', 'reports');
      const liveReportPath = path.join(reportsDir, 'test-summary.html');
      
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Single session data object - this is the key fix
      let sessionData = {
        startTime: Date.now(),
        lastUpdate: Date.now(),
        browser: '',
        testResults: [],
        aiOperations: [],
        healingEvents: [],
        visualComparisons: [],
        currentlyRunning: null,
        testSuites: new Map(),
        metrics: {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          skippedTests: 0,
          totalDuration: 0,
          aiOperationsCount: 0,
          healingEventsCount: 0,
          visualTestsCount: 0,
          successRate: 0,
          avgTestDuration: 0,
          healingSuccessRate: 0,
          visualAccuracy: 0
        }
      };

      // Initialize the HTML report file
      function initializeHTMLReport() {
        const initialHTML = generateLiveHTML(sessionData);
        fs.writeFileSync(liveReportPath, initialHTML);
        console.log('📊 Live report initialized: test-summary.html');
      }

      // Update the single HTML report with current data
      function updateLiveReport() {
        try {
          // Recalculate metrics
          sessionData.metrics = calculateMetrics(sessionData);
          sessionData.lastUpdate = Date.now();
          
          // Generate updated HTML
          const updatedHTML = generateLiveHTML(sessionData);
          fs.writeFileSync(liveReportPath, updatedHTML);
          
          // Only log significant updates to avoid spam
          const totalTests = sessionData.testResults.length;
          if (totalTests % 5 === 0 || sessionData.currentlyRunning) {
            console.log(`📊 Live report updated: ${totalTests} tests completed`);
          }
        } catch (error) {
          console.error('Failed to update live report:', error.message);
        }
      }

      // Calculate real-time metrics
      function calculateMetrics(data) {
        const total = data.testResults.length;
        const passed = data.testResults.filter(t => t.status === 'passed').length;
        const failed = data.testResults.filter(t => t.status === 'failed').length;
        const skipped = data.testResults.filter(t => t.status === 'skipped').length;
        
        const totalDuration = data.testResults.reduce((sum, t) => sum + (t.duration || 0), 0);
        const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;
        
        const successfulHealings = data.healingEvents.filter(h => h.success !== false).length;
        const healingSuccessRate = data.healingEvents.length > 0 
          ? (successfulHealings / data.healingEvents.length * 100).toFixed(1) 
          : '0';
          
        const passedVisualTests = data.visualComparisons.filter(v => v.passed !== false).length;
        const visualAccuracy = data.visualComparisons.length > 0 
          ? (passedVisualTests / data.visualComparisons.length * 100).toFixed(1) 
          : '0';
        
        return {
          totalTests: total,
          passedTests: passed,
          failedTests: failed,
          skippedTests: skipped,
          successRate: total > 0 ? (passed / total * 100).toFixed(1) : '0',
          totalDuration: totalDuration,
          avgTestDuration: avgDuration,
          aiOperationsCount: data.aiOperations.length,
          healingEventsCount: data.healingEvents.length,
          visualTestsCount: data.visualComparisons.length,
          healingSuccessRate: healingSuccessRate,
          visualAccuracy: visualAccuracy
        };
      }

      // Generate the single live HTML report
      function generateLiveHTML(data) {
        const metrics = data.metrics;
        const sessionDurationMs = Date.now() - data.startTime;
        const sessionDuration = formatDuration(sessionDurationMs);
        const lastUpdateTime = new Date(data.lastUpdate).toLocaleString();
        
        // Group tests by suite
        const testsBySuite = new Map();
        data.testResults.forEach(test => {
          const suite = test.suiteName || extractSuiteFromName(test.testName) || 'Other';
          if (!testsBySuite.has(suite)) {
            testsBySuite.set(suite, []);
          }
          testsBySuite.get(suite).push(test);
        });

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 AI Cypress Testing - Live Results</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1rem; }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .metric-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }
        .metric-card:hover { transform: translateY(-5px); }
        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .metric-label {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .info { color: #17a2b8; }
        .warning { color: #ffc107; }
        
        .content { padding: 30px; }
        .section {
            margin-bottom: 40px;
            background: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
        }
        .section h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.5rem;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        
        .test-suite {
            margin-bottom: 25px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        .suite-header {
            background: #667eea;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .suite-stats {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .test-item {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background-color 0.3s ease;
        }
        .test-item:hover { background-color: #f8f9fa; }
        .test-item:last-child { border-bottom: none; }
        
        .test-name { font-weight: 500; flex: 1; }
        .test-status {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-passed { background: #d4edda; color: #155724; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-skipped { background: #fff3cd; color: #856404; }
        .status-running { background: #cce5ff; color: #004085; animation: pulse 2s infinite; }
        
        .test-duration {
            margin-left: 15px;
            color: #666;
            font-size: 0.9rem;
        }
        
        .ai-operations {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .operation-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        .operation-type {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        .operation-details {
            color: #666;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        .status-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
            z-index: 1000;
        }
        .live-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #28a745;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            border-top: 1px solid #eee;
            background: #f8f9fa;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .empty-state i {
            font-size: 3rem;
            margin-bottom: 15px;
            opacity: 0.5;
        }
        
        @media (max-width: 768px) {
            .metrics-grid { grid-template-columns: repeat(2, 1fr); }
            .test-item { flex-direction: column; align-items: flex-start; }
            .test-duration { margin-left: 0; margin-top: 5px; }
        }
    </style>
</head>
<body>
    <div class="status-indicator">
        <span class="live-dot"></span>
        Live Results - Updated: ${lastUpdateTime}
    </div>
    
    <div class="container">
        <div class="header">
            <h1>🤖 AI-Enhanced Cypress Testing</h1>
            <p>Session Duration: ${sessionDuration} | Framework: AI-Enhanced Cypress v2.0</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value passed">${metrics.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value passed">${metrics.passedTests}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value failed">${metrics.failedTests}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value info">${metrics.successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value info">${metrics.avgTestDuration}ms</div>
                <div class="metric-label">Avg Duration</div>
            </div>
            <div class="metric-card">
                <div class="metric-value warning">${metrics.aiOperationsCount}</div>
                <div class="metric-label">AI Operations</div>
            </div>
            <div class="metric-card">
                <div class="metric-value warning">${metrics.healingEventsCount}</div>
                <div class="metric-label">Healing Events</div>
            </div>
            <div class="metric-card">
                <div class="metric-value info">${metrics.visualTestsCount}</div>
                <div class="metric-label">Visual Tests</div>
            </div>
        </div>
        
        <div class="content">
            ${data.currentlyRunning ? `
            <div class="section">
                <h2>🔄 Currently Running</h2>
                <div class="test-item">
                    <span class="test-name">${data.currentlyRunning}</span>
                    <span class="test-status status-running">Running</span>
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <h2>📊 Test Results by Suite</h2>
                ${testsBySuite.size === 0 ? `
                <div class="empty-state">
                    <div style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;">🔍</div>
                    <p>No tests completed yet. Waiting for test execution...</p>
                </div>
                ` : Array.from(testsBySuite.entries()).map(([suiteName, tests]) => {
                    const suiteStats = {
                        total: tests.length,
                        passed: tests.filter(t => t.status === 'passed').length,
                        failed: tests.filter(t => t.status === 'failed').length,
                        duration: tests.reduce((sum, t) => sum + (t.duration || 0), 0)
                    };
                    
                    return `
                    <div class="test-suite">
                        <div class="suite-header">
                            <span>${suiteName}</span>
                            <span class="suite-stats">
                                ${suiteStats.passed}/${suiteStats.total} passed (${formatDuration(suiteStats.duration)})
                            </span>
                        </div>
                        ${tests.map(test => `
                        <div class="test-item">
                            <span class="test-name">${test.testName || test.name || 'Unknown Test'}</span>
                            <div>
                                <span class="test-status status-${test.status || 'unknown'}">${(test.status || 'unknown').toUpperCase()}</span>
                                <span class="test-duration">${test.duration || 0}ms</span>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                    `;
                }).join('')}
            </div>
            
            ${data.aiOperations.length > 0 ? `
            <div class="section">
                <h2>🤖 Recent AI Operations</h2>
                <div class="ai-operations">
                    ${data.aiOperations.slice(-6).map(op => `
                    <div class="operation-card">
                        <div class="operation-type">${op.operation || op.type || 'AI Operation'}</div>
                        <div class="operation-details">
                            Target: ${op.target || op.selector || 'N/A'}<br>
                            Success: ${op.success !== false ? '✅' : '❌'}<br>
                            Duration: ${op.responseTime || op.duration || 0}ms
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${data.healingEvents.length > 0 ? `
            <div class="section">
                <h2>🔧 Self-Healing Events (Success Rate: ${metrics.healingSuccessRate}%)</h2>
                <div class="ai-operations">
                    ${data.healingEvents.slice(-4).map(healing => `
                    <div class="operation-card">
                        <div class="operation-type">Healing: ${healing.type || 'Element Recovery'}</div>
                        <div class="operation-details">
                            Original: ${healing.originalSelector || 'N/A'}<br>
                            Strategy: ${healing.strategy || 'Auto'}<br>
                            Result: ${healing.success !== false ? '✅ Success' : '❌ Failed'}
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${data.visualComparisons.length > 0 ? `
            <div class="section">
                <h2>🎨 Visual Tests (Accuracy: ${metrics.visualAccuracy}%)</h2>
                <div class="ai-operations">
                    ${data.visualComparisons.slice(-4).map(visual => `
                    <div class="operation-card">
                        <div class="operation-type">Visual: ${visual.testName || 'Comparison'}</div>
                        <div class="operation-details">
                            Similarity: ${((visual.similarity || 0) * 100).toFixed(1)}%<br>
                            Type: ${visual.differenceType || 'Unknown'}<br>
                            Result: ${visual.passed !== false ? '✅ Passed' : '❌ Failed'}
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>🤖 AI-Enhanced Cypress Testing Framework v2.0</p>
            <p>This report updates automatically as tests run. Refresh browser if updates stop.</p>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 3 seconds to show live updates
        setInterval(() => {
            window.location.reload();
        }, 3000);
        
        // Add some interactivity
        document.querySelectorAll('.test-item').forEach(item => {
            item.addEventListener('click', () => {
                item.style.backgroundColor = item.style.backgroundColor === 'rgb(248, 249, 250)' ? '' : '#f8f9fa';
            });
        });
    </script>
</body>
</html>`;
      }

      // Helper functions
      function formatDuration(ms) {
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
      }

      function extractSuiteFromName(testName) {
        if (testName.includes('Basic Functionality')) return 'Basic Functionality';
        if (testName.includes('Visual Intelligence')) return 'Visual Intelligence';
        if (testName.includes('Self-Healing')) return 'Self-Healing';
        if (testName.includes('Combined')) return 'Combined Scenarios';
        return 'Other Tests';
      }

      // Initialize the report when Cypress starts
      initializeHTMLReport();

      // FIXED: Updated task handlers for single report
      on('task', {
        // This is the main fix - everything updates the single sessionData and single report
        recordTestResult(testResult) {
          try {
            // Mark currently running test
            sessionData.currentlyRunning = testResult.testName;
            
            // Add test result to session
            sessionData.testResults.push({
              ...testResult,
              timestamp: new Date().toISOString()
            });
            
            // Clear currently running when test completes
            if (testResult.status !== 'running') {
              sessionData.currentlyRunning = null;
            }
            
            // Update the single live report
            updateLiveReport();
            
            return { recorded: true, totalTests: sessionData.testResults.length };
          } catch (error) {
            console.error('Failed to record test result:', error);
            return { recorded: false, error: error.message };
          }
        },

        recordAIOperation(operation) {
          try {
            sessionData.aiOperations.push({
              ...operation,
              timestamp: new Date().toISOString()
            });
            
            // Keep only last 50 operations to prevent memory issues
            if (sessionData.aiOperations.length > 50) {
              sessionData.aiOperations = sessionData.aiOperations.slice(-50);
            }
            
            updateLiveReport();
            return { recorded: true };
          } catch (error) {
            console.error('Failed to record AI operation:', error);
            return { recorded: false, error: error.message };
          }
        },

        recordHealingEvent(healingEvent) {
          try {
            sessionData.healingEvents.push({
              ...healingEvent,
              timestamp: new Date().toISOString()
            });
            
            updateLiveReport();
            return { recorded: true };
          } catch (error) {
            console.error('Failed to record healing event:', error);
            return { recorded: false, error: error.message };
          }
        },

        recordVisualComparison(visualResult) {
          try {
            sessionData.visualComparisons.push({
              ...visualResult,
              timestamp: new Date().toISOString()
            });
            
            updateLiveReport();
            return { recorded: true };
          } catch (error) {
            console.error('Failed to record visual comparison:', error);
            return { recorded: false, error: error.message };
          }
        },

        // REMOVED: All the multiple report generation tasks
        // saveTestReport, saveHealingReport, savePerformanceReport, generateLiveReport, generateSessionReport
        // These were causing multiple reports to be created

        getSessionData() {
          return sessionData;
        },

        logAIInsight(message) {
          // Minimal logging - only for important events
          if (message.includes('Starting') || message.includes('Completed') || message.includes('initialized')) {
            console.log(`🤖 ${message}`);
          }
          return null;
        },

        // Clean old files except our single live report
        cleanOldReports() {
          try {
            const files = fs.readdirSync(reportsDir)
              .filter(file => file !== 'test-summary.html') // Keep our live report
              .filter(file => file.endsWith('.json') || file.endsWith('.html'))
              .map(file => ({
                name: file,
                path: path.join(reportsDir, file),
                time: fs.statSync(path.join(reportsDir, file)).mtime.getTime()
              }))
              .sort((a, b) => b.time - a.time);

            // Keep only the 5 most recent other files, delete the rest
            const filesToDelete = files.slice(5);
            
            filesToDelete.forEach(file => {
              fs.unlinkSync(file.path);
            });
            
            if (filesToDelete.length > 0) {
              console.log(`🧹 Cleaned ${filesToDelete.length} old reports`);
            }
            
            return { cleaned: filesToDelete.length };
          } catch (error) {
            console.error('Failed to clean old reports:', error);
            return { cleaned: 0, error: error.message };
          }
        }
      });

      // Browser launch handler to track browser info
      on('before:browser:launch', (browser, launchOptions) => {
        sessionData.browser = `${browser.name} ${browser.version}`;
        updateLiveReport();
        return launchOptions;
      });

      return config;
    },
  },
});