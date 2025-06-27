// support/utils/helpers.js - Utility functions for AI testing framework
export class TestHelpers {
  /**
   * DOM Utilities
   */
  static dom = {
    // Wait for element to be ready
    waitForElement(selector, timeout = 10000) {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElement = () => {
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Element not found within ${timeout}ms: ${selector}`));
            return;
          }
          
          const element = document.querySelector(selector);
          if (element && TestHelpers.dom.isElementReady(element)) {
            resolve(element);
          } else {
            setTimeout(checkElement, 100);
          }
        };
        
        checkElement();
      });
    },

    // Check if element is ready for interaction
    isElementReady(element) {
      if (!element) return false;
      
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
    },

    // Get element's visual signature
    getElementSignature(element) {
      if (!element) return null;
      
      return {
        tag: element.tagName?.toLowerCase(),
        id: element.id || '',
        classes: Array.from(element.classList || []),
        text: element.textContent?.trim().substring(0, 100) || '',
        attributes: TestHelpers.dom.getKeyAttributes(element),
        position: element.getBoundingClientRect(),
        visible: TestHelpers.dom.isElementReady(element)
      };
    },

    // Get key attributes from element
    getKeyAttributes(element) {
      const keyAttrs = ['data-testid', 'role', 'type', 'name', 'aria-label', 'title', 'placeholder'];
      const attrs = {};
      
      keyAttrs.forEach(attr => {
        if (element.hasAttribute(attr)) {
          attrs[attr] = element.getAttribute(attr);
        }
      });
      
      return attrs;
    },

    // Find elements by text content
    findByText(text, tag = '*') {
      const xpath = `//${tag}[contains(text(), "${text}")]`;
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      return result.singleNodeValue;
    },

    // Get element's XPath
    getXPath(element) {
      if (!element) return '';
      if (element.id) return `//*[@id="${element.id}"]`;
      if (element === document.body) return '/html/body';
      
      let path = '';
      while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.nodeName.toLowerCase();
        if (element.id) {
          selector += `[@id="${element.id}"]`;
          path = `/${selector}${path}`;
          break;
        } else {
          const siblings = Array.from(element.parentNode?.children || []);
          const index = siblings.indexOf(element) + 1;
          selector += `[${index}]`;
        }
        path = `/${selector}${path}`;
        element = element.parentElement;
      }
      
      return path;
    },

    // Check if element is in viewport
    isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    // Scroll element into view
    scrollIntoView(element, behavior = 'smooth') {
      if (element && typeof element.scrollIntoView === 'function') {
        element.scrollIntoView({ 
          behavior, 
          block: 'center', 
          inline: 'center' 
        });
      }
    }
  };

  /**
   * String Utilities
   */
  static string = {
    // Calculate string similarity using Levenshtein distance
    similarity(str1, str2) {
      if (!str1 || !str2) return 0;
      if (str1 === str2) return 1;
      
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;
      
      if (longer.length === 0) return 1;
      
      const editDistance = TestHelpers.string.levenshteinDistance(longer, shorter);
      return (longer.length - editDistance) / longer.length;
    },

    // Levenshtein distance calculation
    levenshteinDistance(str1, str2) {
      const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
      
      for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
      for (let i = 0; i <= str2.length; i++) matrix[i][0] = i;
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2[i - 1] === str1[j - 1]) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      
      return matrix[str2.length][str1.length];
    },

    // Generate hash from string
    hash(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36);
    },

    // Clean and normalize string
    normalize(str) {
      return str.toLowerCase().trim().replace(/\s+/g, ' ');
    },

    // Extract meaningful words from string
    extractKeywords(str, minLength = 3) {
      return str
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= minLength)
        .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word));
    }
  };

  /**
   * Performance Utilities
   */
  static performance = {
    // Measure function execution time
    measure(name, fn) {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      const duration = end - start;
      
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      
      if (result && typeof result.then === 'function') {
        return result.then(res => ({ result: res, duration }));
      }
      
      return { result, duration };
    },

    // Debounce function calls
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Throttle function calls
    throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    // Get memory usage (Chrome only)
    getMemoryUsage() {
      if (typeof window !== 'undefined' && window.performance?.memory) {
        const memory = window.performance.memory;
        return {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        };
      }
      return null;
    }
  };

  /**
   * Validation Utilities
   */
  static validation = {
    // Email validation
    email(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // Phone validation
    phone(phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(phone.replace(/\s/g, ''));
    },

    // URL validation
    url(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },

    // Credit card validation (Luhn algorithm)
    creditCard(number) {
      const cleanNumber = number.replace(/\s/g, '');
      if (!/^\d+$/.test(cleanNumber)) return false;
      
      let sum = 0;
      let shouldDouble = false;
      
      for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber.charAt(i));
        
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
      }
      
      return sum % 10 === 0;
    },

    // Required field validation
    required(value) {
      return value !== null && value !== undefined && value.toString().trim().length > 0;
    },

    // Minimum length validation
    minLength(value, length) {
      return value && value.toString().length >= length;
    },

    // Maximum length validation
    maxLength(value, length) {
      return !value || value.toString().length <= length;
    }
  };

  /**
   * Data Utilities
   */
  static data = {
    // Deep clone object
    clone(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime());
      if (obj instanceof Array) return obj.map(item => TestHelpers.data.clone(item));
      if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
          cloned[key] = TestHelpers.data.clone(obj[key]);
        });
        return cloned;
      }
    },

    // Deep merge objects
    merge(target, ...sources) {
      if (!sources.length) return target;
      const source = sources.shift();
      
      if (TestHelpers.data.isObject(target) && TestHelpers.data.isObject(source)) {
        for (const key in source) {
          if (TestHelpers.data.isObject(source[key])) {
            if (!target[key]) Object.assign(target, { [key]: {} });
            TestHelpers.data.merge(target[key], source[key]);
          } else {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }
      
      return TestHelpers.data.merge(target, ...sources);
    },

    // Check if value is object
    isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    },

    // Get nested property safely
    get(obj, path, defaultValue = undefined) {
      const keys = path.split('.');
      let result = obj;
      
      for (const key of keys) {
        if (result === null || result === undefined) {
          return defaultValue;
        }
        result = result[key];
      }
      
      return result === undefined ? defaultValue : result;
    },

    // Set nested property safely
    set(obj, path, value) {
      const keys = path.split('.');
      let current = obj;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || !TestHelpers.data.isObject(current[key])) {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = value;
      return obj;
    }
  };

  /**
   * Random Utilities
   */
  static random = {
    // Random number between min and max
    number(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Random choice from array
    choice(array) {
      return array[Math.floor(Math.random() * array.length)];
    },

    // Random boolean
    boolean() {
      return Math.random() < 0.5;
    },

    // Random string
    string(length = 10, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },

    // Random email
    email() {
      const domains = ['example.com', 'test.org', 'demo.net'];
      const name = TestHelpers.random.string(8);
      const domain = TestHelpers.random.choice(domains);
      return `${name}@${domain}`;
    },

    // Random UUID v4
    uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };

  /**
   * Date Utilities
   */
  static date = {
    // Format date
    format(date, format = 'YYYY-MM-DD') {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      
      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    },

    // Add days to date
    addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },

    // Get difference in days
    diffDays(date1, date2) {
      const oneDay = 24 * 60 * 60 * 1000;
      return Math.round(Math.abs((date1 - date2) / oneDay));
    },

    // Check if date is valid
    isValid(date) {
      return date instanceof Date && !isNaN(date);
    }
  };

  /**
   * Browser Detection
   */
  static browser = {
    // Detect browser type
    detect() {
      const userAgent = navigator.userAgent;
      
      if (userAgent.includes('Chrome')) return 'chrome';
      if (userAgent.includes('Firefox')) return 'firefox';
      if (userAgent.includes('Safari')) return 'safari';
      if (userAgent.includes('Edge')) return 'edge';
      
      return 'unknown';
    },

    // Check if mobile
    isMobile() {
      return window.innerWidth <= 768;
    },

    // Check if tablet
    isTablet() {
      return window.innerWidth > 768 && window.innerWidth <= 1024;
    },

    // Check if desktop
    isDesktop() {
      return window.innerWidth > 1024;
    },

    // Get viewport size
    getViewport() {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
  };

  /**
   * Test Data Generators
   */
  static testData = {
    // Generate test user
    user() {
      const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
      
      return {
        firstName: TestHelpers.random.choice(firstNames),
        lastName: TestHelpers.random.choice(lastNames),
        email: TestHelpers.random.email(),
        phone: `555-${TestHelpers.random.number(100, 999)}-${TestHelpers.random.number(1000, 9999)}`,
        age: TestHelpers.random.number(18, 80)
      };
    },

    // Generate test address
    address() {
      const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm Way', 'Cedar Ln'];
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
      const states = ['NY', 'CA', 'IL', 'TX', 'AZ'];
      
      return {
        street: `${TestHelpers.random.number(100, 9999)} ${TestHelpers.random.choice(streets)}`,
        city: TestHelpers.random.choice(cities),
        state: TestHelpers.random.choice(states),
        zipCode: String(TestHelpers.random.number(10000, 99999))
      };
    },

    // Generate test product
    product() {
      const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
      const adjectives = ['Premium', 'Deluxe', 'Professional', 'Compact', 'Advanced'];
      const nouns = ['Device', 'Tool', 'Kit', 'Set', 'System'];
      
      return {
        name: `${TestHelpers.random.choice(adjectives)} ${TestHelpers.random.choice(nouns)}`,
        category: TestHelpers.random.choice(categories),
        price: TestHelpers.random.number(10, 1000),
        rating: (TestHelpers.random.number(30, 50) / 10).toFixed(1)
      };
    }
  };

  /**
   * Color Utilities
   */
  static color = {
    // Convert hex to RGB
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },

    // Convert RGB to hex
    rgbToHex(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // Calculate color difference
    difference(color1, color2) {
      const rgb1 = typeof color1 === 'string' ? TestHelpers.color.hexToRgb(color1) : color1;
      const rgb2 = typeof color2 === 'string' ? TestHelpers.color.hexToRgb(color2) : color2;
      
      if (!rgb1 || !rgb2) return 1; // Maximum difference if invalid colors
      
      const rDiff = Math.abs(rgb1.r - rgb2.r) / 255;
      const gDiff = Math.abs(rgb1.g - rgb2.g) / 255;
      const bDiff = Math.abs(rgb1.b - rgb2.b) / 255;
      
      return (rDiff + gDiff + bDiff) / 3;
    }
  };
}

// Export helper instance
export const helpers = TestHelpers;