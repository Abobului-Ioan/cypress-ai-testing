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
```
Simply open the index.html file in the qa_web_site directory with VS Code's Live Server. Ensure it's running on http://127.0.0.1:5500/.

3. **Open Cypress:**
```bash
cd C:\Users\Ioan\Workspace\cypress-ai-testing
npx cypress open
```
This will launch the Cypress Test Runner.

## 🧪 Running Tests

Once Cypress is open:

1. Select "E2E Testing".

2. Choose your preferred browser (Chrome is recommended for full AI capabilities).

3. Click "Start E2E Testing".

4. From the list of test files, you can select specific tests to run:
   - `01-basic-functionality.cy.js`: Basic AI element finding and navigation.
   - `02-visual-intelligence.cy.js`: Visual regression and dynamic content handling.
   - `03-self-healing.cy.js`: Demonstrates self-healing when selectors change.
   - `04-combined-scenarios.cy.js`: Combines all AI features in complex workflows.

Alternatively, you can run all tests from the command line:

```bash
npm test
# or with a headed browser for visual observation
npm run test:headed
```

## 📈 Reports and Insights

This framework generates a single, live HTML report (`cypress/reports/test-summary.html`) that updates in real-time as tests execute.

To view the live report:
Open `cypress/reports/test-summary.html` in your web browser while tests are running.

The report provides:

- **Test Summary**: Total tests, passed/failed, success rate.
- **AI Metrics**: Total AI operations, healing events, visual comparisons, and confidence scores.
- **Performance**: Average test duration, element finding time, cache hit rate.
- **Key Insights & Recommendations**: Actionable suggestions from the AI system for test and application improvement.

## 💡 Usage Examples

### 1. AI-Enhanced Element Finding
Instead of `cy.get()`, use `cy.findByAI()` for intelligent element location:

```javascript
// Finds the element even if its data-testid changes or it moves slightly
cy.findByAI('[data-testid="shop-now-button"]').click();

// Clicks an element based on its visible text, great for dynamic buttons
cy.clickByAI('Add to Cart');
```

### 2. Self-Healing Forms
Use `cy.healingFillForm()` to robustly fill forms, adapting to selector changes:

```javascript
cy.healingFillForm('#contact-form', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com'
});
```

### 3. Smart Visual Testing
Use `cy.visualTest()` for AI-powered visual comparisons that understand functional equivalence and ignore dynamic content:

```javascript
// Take a visual snapshot of the product page, ignoring dynamic elements
cy.visualTest('product-page-layout', {
  ignoreDynamicContent: true,
  functionalEquivalence: true
});

// Compare two screenshots intelligently
cy.compareScreenshots('baseline-header', 'current-header', {
  functionalEquivalence: true,
  threshold: 0.05
});
```

### 4. Confidence Monitoring
Access AI metrics and confidence scores for proactive maintenance:

```javascript
cy.task('getSessionData').then((sessionData) => {
  const aiOperations = sessionData.aiOperations || [];
  const totalSuccess = aiOperations.filter(op => op.success).length;
  const successRate = totalSuccess / Math.max(aiOperations.length, 1);
  cy.log(`AI Operations Success Rate: ${(successRate * 100).toFixed(2)}%`);
});
```

## 🤝 Contributing

We welcome contributions to this project!

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/your-feature-name`).
3. Implement your changes and add relevant tests.
4. Ensure all existing tests pass (`npm test`).
5. Commit your changes (`git commit -m 'feat: Add new feature'`).
6. Push to the branch (`git push origin feature/your-feature-name`).
7. Open a Pull Request.


## 🆘 Troubleshooting

### Common Issues

**Site Not Loading (http://127.0.0.1:5500/):**

- Ensure you started Live Server in VS Code.
- Check your browser if http://127.0.0.1:5500/ is accessible directly.
- Restart the server and Cypress.

**Tests Failing Unexpectedly:**

- **"AI could not find element"**: This error indicates the AI engine couldn't locate the element even with its fallback strategies. This is a good sign the AI is working, but it means a significant change might have occurred or the initial selector was too vague.
  - Inspect the page manually to see if the element is present, visible, or has changed fundamentally.
  - Review the `cypress/reports/healing/` directory for healing attempts and their confidence scores. Low confidence might indicate a need to update the base selector.
  - Consider adjusting the timeout option in findByAI for slower-loading elements.

- **Visual tests failing:**
  - Review the generated difference images in `cypress/screenshots/`.
  - Adjust `threshold`, `colorTolerance`, or `layoutTolerance` in visualTest options if acceptable visual changes are causing failures.
  - Ensure `ignoreDynamicContent: true` is set for areas with animations, timestamps, or ads.

- **Performance degradation:**
  - Check the "Performance" section in `cypress/reports/test-summary.html` for specific slow operations or memory warnings.
  - Review network requests in Cypress DevTools during test runs.

### Debugging

Enable detailed AI logging by setting an environment variable before running Cypress:

```bash
CYPRESS_enableAILogging=true npx cypress open
# or for a run
CYPRESS_enableAILogging=true npm test
```

This will provide more verbose output in the Cypress console about AI operations, healing attempts, and learning processes.

For in-depth Cypress debugging, use the DEBUG environment variable:

```bash
DEBUG=cypress:* npx cypress open
```

This framework now provides real AI capabilities that genuinely improve test reliability, adapt to UI changes, and learn from experience! 🚀🤖