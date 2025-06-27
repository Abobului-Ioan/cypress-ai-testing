# AI-Enhanced Cypress Testing Framework

A sophisticated testing framework that combines traditional Cypress E2E testing with AI-powered visual regression testing and self-healing test automation.

## 🚀 Features

### 🧠 AI-Enhanced Visual Testing
- **Intelligent Image Comparison**: Uses TensorFlow.js to understand functional equivalence
- **Dynamic Content Detection**: Automatically ignores promotional banners, loading states, and animations
- **Cross-browser Visual Testing**: Consistent visual validation across different browsers
- **Responsive Testing**: Automated testing across multiple viewport sizes

### 🔧 Self-Healing Test Framework
- **Smart Selector Strategies**: Multiple fallback approaches when primary selectors fail
- **Semantic Element Detection**: Understands UI context and meaning
- **Progressive Learning**: Improves selector reliability over multiple test runs
- **Confidence Scoring**: Provides metrics on healing success and reliability

### 📊 Combined AI Power
- **Comprehensive Reporting**: Detailed healing reports with confidence scores
- **Visual + Functional Testing**: Combines visual regression with interaction testing
- **Adaptation Metrics**: Tracks how well tests adapt to UI changes

## 🛠 Installation

1. **Clone the repository and install dependencies:**
```bash
npm install
```

2. **Start the test application:**
```bash
# Start the e-commerce demo app (from the qa_web_site directory)
cd ../qa_web_site
python -m http.server 8080

# Or use the npm script (if you have concurrent setup)
npm run serve-app
```

3. **Run Cypress tests:**
```bash
# Open Cypress Test Runner
npm run cypress:open

# Run all tests headlessly
npm test

# Run specific test scenarios
npm run test:visual
npm run test:self-healing
npm run test:combined
```

## 🧪 Test Scenarios

### Scenario 1: Visual Regression with Intelligence
**File**: `cypress/e2e/visual-regression/scenario1-visual-intelligence.cy.js`

Tests the AI's ability to:
- Recognize functional equivalence when button colors change
- Understand layout rearrangements while preserving content
- Auto-detect and ignore dynamic promotional banners
- Handle loading states and animations intelligently

```javascript
// Example: Testing button color changes
cy.visualTest('buttons-baseline');
cy.window().then(win => win.testFunctions.changeButtonColors());
cy.smartVisualDiff('buttons-color-changed', {
  functionalEquivalence: true,
  colorTolerance: 0.3
});
```

### Scenario 2: Self-Healing in Action
**File**: `cypress/e2e/self-healing/scenario2-self-healing.cy.js`

Demonstrates adaptation when:
- Class names change during refactoring
- HTML structure is modified
- CSS frameworks are replaced
- Elements are moved or restructured

```javascript
// Example: Self-healing click with multiple strategies
cy.healingClick('[data-testid="add-to-cart-1"]', {
  maxAttempts: 5,
  adaptToChanges: true,
  logHealing: true
});
```

### Scenario 3: Combined Power
**File**: `cypress/e2e/combined/scenario3-combined-power.cy.js`

Shows the full framework capabilities:
- Complete checkout flow redesign adaptation
- End-to-end user journey resilience
- Comprehensive confidence scoring
- Progressive improvement across test runs

```javascript
// Example: Smart visual diff with functional equivalence
cy.smartVisualDiff('checkout-flow-redesigned', {
  functionalEquivalence: true,
  layoutTolerance: 0.3,
  colorTolerance: 0.2
});
```

## 🎯 Custom Commands

### AI-Enhanced Commands

#### `cy.getByAI(selector, options)`
Enhanced element finding with multiple fallback strategies:
```javascript
cy.getByAI('[data-testid="submit-button"]', {
  timeout: 10000,
  retries: 3,
  confidenceThreshold: 0.8,
  fallbackStrategies: true
});
```

#### `cy.healingClick(selector, options)`
Self-healing click that adapts to UI changes:
```javascript
cy.healingClick('.submit-btn', {
  maxAttempts: 5,
  adaptToChanges: true,
  logHealing: true
});
```

#### `cy.healingFillForm(formSelector, formData, options)`
Intelligent form filling with field adaptation:
```javascript
cy.healingFillForm('[data-testid="login-form"]', {
  email: 'user@example.com',
  password: 'password123'
}, {
  adaptFieldSelectors: true,
  skipMissingFields: false
});
```

### Visual Testing Commands

#### `cy.visualTest(name, options)`
AI-enhanced visual testing:
```javascript
cy.visualTest('homepage-redesign', {
  threshold: 0.1,
  ignoreDynamicContent: true,
  confidenceLevel: 0.8
});
```

#### `cy.smartVisualDiff(name, options)`
Intelligent visual comparison:
```javascript
cy.smartVisualDiff('product-page-changes', {
  functionalEquivalence: true,
  layoutTolerance: 0.2,
  colorTolerance: 0.3
});
```

#### `cy.responsiveVisualTest(name, viewports)`
Cross-device visual testing:
```javascript
cy.responsiveVisualTest('responsive-layout', [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 720, name: 'desktop' }
]);
```

## 📁 Project Structure

```
cypress-ai-testing/
├── cypress/
│   ├── e2e/
│   │   ├── visual-regression/     # Visual testing scenarios
│   │   ├── self-healing/          # Self-healing scenarios
│   │   └── combined/              # Combined AI power tests
│   ├── support/
│   │   ├── ai/                    # AI modules
│   │   │   ├── visual-ai.js       # Visual intelligence
│   │   │   └── selector-ai.js     # Selector optimization
│   │   ├── commands/              # Custom commands
│   │   │   ├── ai-commands.js     # AI-enhanced commands
│   │   │   ├── visual-commands.js # Visual testing commands
│   │   │   └── self-healing-commands.js # Self-healing commands
│   │   └── e2e.js                 # Main support file
│   ├── fixtures/                  # Test data
│   ├── reports/                   # Generated reports
│   └── screenshots/               # Visual baselines and diffs
├── package.json
├── cypress.config.js
└── README.md
```

## 🔬 AI Components

### Visual AI Module (`cypress/support/ai/visual-ai.js`)
- **TensorFlow.js Integration**: Uses CNN models for feature extraction
- **Pixel-level Comparison**: Traditional pixel comparison with pixelmatch
- **Intelligent Thresholds**: Dynamic threshold adjustment based on content
- **Functional Equivalence Detection**: Understands when changes don't affect functionality

### Selector AI Module (`cypress/support/ai/selector-ai.js`)
- **Multiple Selector Strategies**: ID, class, semantic, text-based approaches
- **Confidence Scoring**: Evaluates selector reliability
- **Learning System**: Improves over time based on success patterns
- **Semantic Understanding**: Maps UI elements to their functional purpose

## 📊 Reports and Insights

### Healing Reports
Generated automatically in `cypress/reports/healing/`:
```json
{
  "testName": "Complete checkout flow redesign",
  "timestamp": "2024-03-15T10:30:00.000Z",
  "healingAttempts": [
    {
      "originalSelector": "[data-testid='submit-btn']",
      "successfulSelector": ".submit-button",
      "strategy": "class-name-fallback",
      "confidence": 0.85,
      "timestamp": "2024-03-15T10:30:01.000Z"
    }
  ],
  "testResult": "passed",
  "recommendations": [
    "Consider adding data-testid attributes for better stability"
  ]
}
```

### Visual Analysis Reports
Detailed insights on visual changes:
- **Difference Type**: Identical, stylistic, structural, or significant
- **Confidence Scores**: AI confidence in visual similarity
- **AI Insights**: Automated analysis of detected changes
- **Recommendations**: Suggestions for test improvement

## 🎛 Configuration

### Environment Variables (cypress.config.js)
```javascript
env: {
  // Visual testing settings
  visualThreshold: 0.1,
  visualDiffThreshold: 0.05,
  
  // Self-healing settings
  maxSelectorAttempts: 5,
  selectorConfidenceThreshold: 0.8,
  
  // AI model settings
  tfModelPath: 'cypress/support/ai/models',
  enableAILogging: true
}
```

## 🚦 Running Tests

### Development Mode
```bash
# Start app and open Cypress
npm start
```

### CI/CD Mode
```bash
# Run all tests headlessly
npm test

# Run with specific browser
npm run test:chrome

# Run specific scenario
npm run test:visual
```

### Custom Test Runs
```bash
# Run with AI logging enabled
CYPRESS_enableAILogging=true npm test

# Run with higher confidence threshold
CYPRESS_selectorConfidenceThreshold=0.9 npm test
```

## 🔧 Customization

### Adding New Healing Strategies
Extend the selector strategies in `cypress/support/ai/selector-ai.js`:
```javascript
generateSelectorCandidates(targetElementInfo, document) {
  // Add your custom strategy
  candidates.push({
    selector: `[custom-attr="${value}"]`,
    strategy: 'custom-strategy',
    specificity: 85,
    stability: 90
  });
}
```

### Custom Visual Analysis
Extend visual AI capabilities in `cypress/support/ai/visual-ai.js`:
```javascript
generateInsights(pixelComparison, featureComparison) {
  // Add custom analysis logic
  if (customCondition) {
    insights.push('Custom insight detected');
  }
}
```

## 📚 Best Practices

### 1. Test Data Attributes
Use `data-testid` attributes for the most reliable selectors:
```html
<button data-testid="submit-button">Submit</button>
```

### 2. Semantic HTML
Use proper semantic elements to improve fallback strategies:
```html
<nav role="navigation" aria-label="Main navigation">
  <ul role="menubar">
    <li role="none">
      <a href="/products" role="menuitem">Products</a>
    </li>
  </ul>
</nav>
```

### 3. Visual Test Organization
Group related visual tests and use descriptive names:
```javascript
cy.visualTest('checkout-flow-step-1-shipping');
cy.visualTest('checkout-flow-step-2-payment');
cy.visualTest('checkout-flow-step-3-confirmation');
```

### 4. Confidence Monitoring
Monitor confidence scores and act on low scores:
```javascript
cy.get('@healingAttempts').then((attempts) => {
  const avgConfidence = attempts.reduce((sum, a) => sum + a.confidence, 0) / attempts.length;
  if (avgConfidence < 0.7) {
    cy.task('logAIInsight', 'Low confidence detected - review selectors');
  }
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

**TensorFlow.js not loading:**
- Ensure internet connection for CDN access
- Check browser compatibility

**Visual tests failing unexpectedly:**
- Check threshold settings
- Verify baseline images exist
- Review dynamic content detection

**Healing strategies not working:**
- Increase maxAttempts
- Check element visibility
- Review selector strategies

### Debug Mode
Enable detailed logging:
```bash
CYPRESS_enableAILogging=true DEBUG=cypress:* npm test
```

## 📞 Support

For questions and support:
- Check the troubleshooting section
- Review test logs in `cypress/reports/`
- Enable AI logging for detailed insights