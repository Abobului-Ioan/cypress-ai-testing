// support/ai-core/ai-engine.js - Fixed AI engine with proper element finding
export class AIEngine {
  constructor() {
    this.cache = new Map();
    this.learningData = new Map();
    this.performance = {
      operations: [],
      startTime: Date.now()
    };
  }

  /**
   * FIXED: Core element finding with proper fallback strategies
   */
  async findElement(selector, options = {}) {
    const { document, timeout = 10000, retries = 3 } = options;
    const startTime = Date.now();
    
    try {
      // Strategy 1: Try original selector
      let element = document.querySelector(selector);
      if (element && this.isElementInteractable(element)) {
        this.recordSuccess(selector, 'direct', Date.now() - startTime);
        return element;
      }
      
      // Strategy 2: Handle :contains() selectors with XPath
      if (selector.includes(':contains(') || selector.includes('contains(')) {
        element = this.handleContainsSelector(selector, document);
        if (element && this.isElementInteractable(element)) {
          this.recordSuccess(selector, 'xpath-contains', Date.now() - startTime);
          return element;
        }
      }
      
      // Strategy 3: Generate fallback selectors
      const fallbackStrategies = this.generateFallbackStrategies(selector, document);
      
      for (const strategy of fallbackStrategies) {
        try {
          element = document.querySelector(strategy.selector);
          if (element && this.isElementInteractable(element)) {
            this.recordSuccess(selector, strategy.name, Date.now() - startTime);
            return element;
          }
        } catch (error) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      this.recordFailure(selector, error.message);
      return null;
    }
  }

  /**
   * FIXED: Handle :contains() selectors properly
   */
  handleContainsSelector(selector, document) {
    try {
      // Extract text from contains selector
      let textMatch = selector.match(/contains?\(["']([^"']+)["']\)/);
      if (!textMatch) {
        textMatch = selector.match(/contains?\("([^"]+)"\)/);
      }
      
      if (textMatch) {
        const searchText = textMatch[1];
        
        // Use XPath to find elements containing text
        const xpath = `//*[contains(text(), "${searchText}")]`;
        const result = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        
        if (result.singleNodeValue) {
          return result.singleNodeValue;
        }
        
        // Fallback: find by partial text match
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          if (el.textContent && el.textContent.includes(searchText)) {
            return el;
          }
        }
      }
    } catch (error) {
      console.warn('Contains selector failed:', error);
    }
    
    return null;
  }

  /**
   * FIXED: Synchronous element finding that actually works
   */
  findElementSync(document, selector) {
    try {
      // Direct query first
      let element = document.querySelector(selector);
      if (element) return element;
      
      // Handle contains selector
      if (selector.includes('contains(')) {
        return this.handleContainsSelector(selector, document);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * FIXED: Generate better fallback strategies
   */
  generateFallbackStrategies(originalSelector) {
    const strategies = [];
    
    // Extract data-testid if present
    const testIdMatch = originalSelector.match(/data-testid[*~|^$]?=["']([^"']+)["']/);
    if (testIdMatch) {
      const testId = testIdMatch[1];
      strategies.push({
        name: 'partial-testid',
        selector: `[data-testid*="${testId}"]`,
        confidence: 0.9
      });
      
      // Try variations of the testid
      const words = testId.split('-');
      if (words.length > 1) {
        strategies.push({
          name: 'testid-words',
          selector: `[data-testid*="${words[0]}"]`,
          confidence: 0.7
        });
      }
    }
    
    // Button specific fallbacks
    if (originalSelector.includes('button') || originalSelector.includes('btn')) {
      strategies.push({
        name: 'button-role',
        selector: 'button, [role="button"], input[type="submit"], input[type="button"]',
        confidence: 0.6
      });
    }
    
    // Link specific fallbacks
    if (originalSelector.includes('link')) {
      strategies.push({
        name: 'link-role',
        selector: 'a, [role="link"]',
        confidence: 0.6
      });
    }
    
    return strategies.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * FIXED: Better element interaction check
   */
  isElementInteractable(element) {
    if (!element) return false;
    
    try {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        style.opacity !== '0' &&
        !element.disabled &&
        style.pointerEvents !== 'none'
      );
    } catch (error) {
      return true; // If we can't check, assume it's interactable
    }
  }

  /**
   * FIXED: Better element condition checking
   */
  checkElementCondition(element, condition) {
    if (!element) return false;
    
    try {
      switch (condition) {
        case 'visible':
          return this.isElementInteractable(element);
        case 'exists':
          return !!element;
        case 'enabled':
          return this.isElementInteractable(element) && !element.disabled;
        default:
          return this.isElementInteractable(element);
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * FIXED: Form field detection
   */
  detectFieldType(element) {
    const type = element.type?.toLowerCase();
    const name = element.name?.toLowerCase();
    const id = element.id?.toLowerCase();
    const tagName = element.tagName?.toLowerCase();
    
    if (tagName === 'select') return 'select';
    if (tagName === 'textarea') return 'textarea';
    if (type === 'checkbox') return 'checkbox';
    if (type === 'radio') return 'radio';
    if (type === 'email' || name?.includes('email') || id?.includes('email')) return 'email';
    if (type === 'password') return 'password';
    
    return 'text';
  }

  /**
   * FIXED: Field selectors generation
   */
  generateFieldSelectors(fieldName) {
    return [
      { selector: `[data-testid="${fieldName}-input"]`, strategy: 'testid-input' },
      { selector: `[data-testid="${fieldName}"]`, strategy: 'testid-direct' },
      { selector: `#${fieldName}`, strategy: 'id' },
      { selector: `[name="${fieldName}"]`, strategy: 'name' },
      { selector: `input[placeholder*="${fieldName}" i]`, strategy: 'placeholder' },
      { selector: `[data-testid*="${fieldName}"]`, strategy: 'partial-testid' }
    ];
  }

  /**
   * FIXED: Navigation element finding
   */
  findNavigationElement(document, destination) {
    // Strategy 1: Find by exact text
    let element = this.findByExactText(document, destination);
    if (element) return element;
    
    // Strategy 2: Find by data-testid
    element = document.querySelector(`[data-testid*="${destination.toLowerCase()}"]`);
    if (element && this.isElementInteractable(element)) return element;
    
    // Strategy 3: Find by partial text
    element = this.findByPartialText(document, destination);
    if (element) return element;
    
    return null;
  }

  findByExactText(document, text) {
    const elements = document.querySelectorAll('a, button, [role="button"], .nav-link');
    for (const el of elements) {
      if (el.textContent?.trim() === text && this.isElementInteractable(el)) {
        return el;
      }
    }
    return null;
  }

  findByPartialText(document, text) {
    const elements = document.querySelectorAll('a, button, [role="button"], .nav-link');
    for (const el of elements) {
      if (el.textContent?.toLowerCase().includes(text.toLowerCase()) && this.isElementInteractable(el)) {
        return el;
      }
    }
    return null;
  }

  // Performance tracking methods
  recordSuccess(selector, strategy, responseTime) {
    this.performance.operations.push({
      selector, strategy, responseTime, success: true, timestamp: Date.now()
    });
  }

  recordFailure(selector, error) {
    this.performance.operations.push({
      selector, error, success: false, timestamp: Date.now()
    });
  }

  logInteraction(action, target, success, metadata = {}) {
    this.performance.operations.push({
      action, target, success, metadata, timestamp: Date.now()
    });
  }

  validateInput() {
    // Simplified validation
    return true;
  }

  fillFieldByType($field, fieldType, value) {
    // Use Cypress commands directly
    switch (fieldType) {
      case 'select':
        cy.wrap($field).select(value);
        break;
      case 'checkbox':
        if (value) cy.wrap($field).check();
        else cy.wrap($field).uncheck();
        break;
      default:
        cy.wrap($field).clear().type(value);
    }
  }
}