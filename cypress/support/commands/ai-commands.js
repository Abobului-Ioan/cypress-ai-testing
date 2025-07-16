// support/commands/ai-commands.js 
import { AIEngine } from '../ai-core/ai-engine.js';

const aiEngine = new AIEngine();


Cypress.Commands.add('findByAI', (selector, options = {}) => {
  const { timeout = 10000, retries = 3 } = options;
  

  return cy.document().then((doc) => {
    const element = doc.querySelector(selector);
    if (element) {
      return cy.wrap(element);
    } else {
      // Try AI engine fallback
      const foundElement = aiEngine.findElementSync(doc, selector);
      
      if (foundElement) {
        return cy.wrap(foundElement);
      } else {
        throw new Error(`AI could not find element: ${selector}`);
      }
    }
  });
});


Cypress.Commands.add('clickByAI', (selector, options = {}) => {
  return cy.findByAI(selector, options).then(($element) => {
    cy.wrap($element).should('be.visible');
    cy.wrap($element).scrollIntoView();
    cy.wrap($element).click({ force: options.force || false });
    
    aiEngine.logInteraction('click', selector, true);
  });
});


Cypress.Commands.add('navigateByAI', (destination, options = {}) => {
  return cy.document().then((doc) => {
    // Simple approach: find by data-testid pattern first
    const testId = `${destination.toLowerCase()}-link`;
    
    return cy.get(`[data-testid="${testId}"]`, { timeout: 5000 })
      .should('be.visible')
      .click()
      .then(() => {
        aiEngine.logInteraction('navigate', destination, true);
      });
  });
});


Cypress.Commands.add('waitForAI', (selector, options = {}) => {
  const { timeout = 10000, condition = 'visible' } = options;
  

  return cy.document().then((doc) => {
    const element = doc.querySelector(selector);
    if (element) {
      return cy.get(selector, { timeout }).should('exist').then(($element) => {
        if (condition === 'visible') {
          cy.wrap($element).should('be.visible');
        }
        return cy.wrap($element);
      });
    } else {
      // Element doesn't exist - try alternative selectors
      const alternatives = getAlternativeSelectors(selector);
      
      for (const altSelector of alternatives) {
        const altElement = doc.querySelector(altSelector);
        if (altElement) {
          return cy.get(altSelector, { timeout }).should('exist');
        }
      }
      
      throw new Error(`Element not found: ${selector}`);
    }
  });
});

function getAlternativeSelectors(selector) {
  const mapping = {
    '[data-testid="hero-section"]': '.hero-section',
    '[data-testid="features-grid"]': '.features-grid', 
    '[data-testid="filtered-results"]': '[data-testid="products-grid"]',
    // Add more mappings as needed
  };
  
  return mapping[selector] ? [mapping[selector]] : [];
}


Cypress.Commands.add('fillFormByAI', (formSelector, formData, options = {}) => {
  const { skipMissing = false } = options;
  
  return cy.get(formSelector).within(() => {
    Object.entries(formData).forEach(([fieldName, value]) => {

      const fieldMapping = {
        'firstName': 'first-name-input',
        'lastName': 'last-name-input', 
        'email': 'email-input',
        'phone': 'phone-input',
        'address': 'address-input',
        'city': 'city-input'
      };
      
      const actualFieldName = fieldMapping[fieldName] || fieldName;
      const selector = `[data-testid="${actualFieldName}"]`;

      cy.document().then((doc) => {
        const field = doc.querySelector(selector);
        if (field) {
          cy.get(selector).then(($field) => {
            const fieldType = $field[0].tagName.toLowerCase();
            
            switch (fieldType) {
              case 'select':
                cy.wrap($field).select(value);
                break;
              case 'input':
                if ($field.attr('type') === 'checkbox') {
                  if (value) cy.wrap($field).check();
                  else cy.wrap($field).uncheck();
                } else {
                  cy.wrap($field).clear().type(value);
                }
                break;
              default:
                cy.wrap($field).clear().type(value);
            }
          });
        } else if (!skipMissing) {
          cy.log(`⚠️ Field not found: ${fieldName} (${selector})`);
        }
      });
    });
  });
});

console.log('🤖 AI Commands loaded successfully');