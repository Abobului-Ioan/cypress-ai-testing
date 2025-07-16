// support/ai-core/learning-system.js 
export class LearningSystem {
  constructor() {
    this.learningData = {
      selectors: new Map(),
      strategies: new Map(),
      patterns: new Map()
    };
    
    this.sessionData = {
      startTime: Date.now(),
      operations: [],
      improvements: []
    };
    
    this.initialized = false;
  }

  /**
   * Initialize learning system
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      this.initialized = true;
      console.log('🧠 Learning System initialized');
    } catch (error) {
      console.warn('Learning System initialization warning:', error);
      this.initialized = true;
    }
  }

  /**
   * Record successful element interaction
   */
  recordSuccess(selector, strategy, responseTime, context = {}) {
    this.initialize();
    
    const elementKey = this.generateElementKey(selector, context);
    const timestamp = Date.now();
    
    // Record selector success
    if (!this.learningData.selectors.has(elementKey)) {
      this.learningData.selectors.set(elementKey, {
        selector,
        successes: 0,
        failures: 0,
        strategies: new Map(),
        avgResponseTime: 0,
        confidence: 0.5,
        lastUsed: timestamp,
        context
      });
    }
    
    const selectorData = this.learningData.selectors.get(elementKey);
    selectorData.successes++;
    selectorData.lastUsed = timestamp;
    
    // Update response time
    if (selectorData.avgResponseTime === 0) {
      selectorData.avgResponseTime = responseTime;
    } else {
      selectorData.avgResponseTime = (selectorData.avgResponseTime + responseTime) / 2;
    }
    
    // Update confidence
    selectorData.confidence = selectorData.successes / (selectorData.successes + selectorData.failures);
    
    // Record strategy success
    if (!selectorData.strategies.has(strategy)) {
      selectorData.strategies.set(strategy, { successes: 0, failures: 0 });
    }
    selectorData.strategies.get(strategy).successes++;
    
    // Record session operation
    this.sessionData.operations.push({
      type: 'success',
      selector,
      strategy,
      responseTime,
      timestamp,
      context
    });
  }

  /**
   * Learn from healing success
   */
  recordHealingSuccess(originalSelector, healedSelector, strategy, metadata = {}) {
    this.initialize();
    
    const timestamp = Date.now();
    
    // Record healing pattern
    const healingKey = `healing_${originalSelector}_${strategy}`;
    if (!this.learningData.patterns.has(healingKey)) {
      this.learningData.patterns.set(healingKey, {
        originalSelector,
        healedSelectors: new Map(),
        strategy,
        successes: 0,
        confidence: 0.5
      });
    }
    
    const healingData = this.learningData.patterns.get(healingKey);
    healingData.successes++;
    
    // Track successful healed selectors
    if (!healingData.healedSelectors.has(healedSelector)) {
      healingData.healedSelectors.set(healedSelector, 0);
    }
    healingData.healedSelectors.set(healedSelector, healingData.healedSelectors.get(healedSelector) + 1);
    
    // Update confidence
    healingData.confidence = Math.min(0.95, healingData.confidence + 0.1);
    
    // Record improvement
    this.sessionData.improvements.push({
      type: 'healing-success',
      originalSelector,
      healedSelector,
      strategy,
      confidence: metadata.confidence || healingData.confidence,
      timestamp
    });
    
    // Learn from the successful healing
    this.recordSuccess(healedSelector, strategy, metadata.responseTime || 0, metadata.context);
  }

  /**
   * Get learning analytics
   */
  getLearningAnalytics() {
    return {
      session: {
        duration: Date.now() - this.sessionData.startTime,
        operations: this.sessionData.operations.length,
        improvements: this.sessionData.improvements.length
      },
      overall: {
        learnedSelectors: this.learningData.selectors.size,
        strategies: this.learningData.strategies.size,
        patterns: this.learningData.patterns.size
      }
    };
  }

  /**
   * Generate element key for storage
   */
  generateElementKey(selector, context = {}) {
    const contextKey = context.page || 'unknown';
    return `${contextKey}_${this.hashSelector(selector)}`;
  }

  /**
   * Simple hash function for selectors
   */
  hashSelector(selector) {
    let hash = 0;
    for (let i = 0; i < selector.length; i++) {
      const char = selector.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

export const learningSystem = new LearningSystem();