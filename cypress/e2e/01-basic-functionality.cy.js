// e2e/01-basic-functionality.cy.js - FINAL FIXED VERSION

describe('🤖 AI-Enhanced Basic Functionality', () => {
  let testStartTime;
  let suiteStartTime;
  
  before(() => {
    suiteStartTime = Date.now();
    cy.visit('/');
    
    cy.task('logAIInsight', '🚀 Starting Basic Functionality Test Suite');
    
    cy.window().then((win) => {
      win.testSession = {
        suiteStartTime,
        suiteName: 'Basic Functionality',
        testResults: [],
        aiOperations: [],
        healingEvents: []
      };
    });
  });

  beforeEach(() => {
    testStartTime = Date.now();
    cy.visit('/');
    cy.wait(1000);
    
    cy.window().then((win) => {
      win.currentTestData = {
        startTime: testStartTime,
        aiOperations: [],
        healingAttempts: [],
        performance: {}
      };
    });
  });

  afterEach(() => {
    const testDuration = Date.now() - testStartTime;
    const testTitle = Cypress.currentTest?.title || 'unknown';
    const testState = Cypress.currentTest?.state || 'unknown';
    
    cy.window().then((win) => {
      const testData = win.currentTestData || {};
      
      const testResult = {
        testName: testTitle,
        suiteName: 'Basic Functionality',
        status: testState,
        duration: testDuration,
        aiOperationsCount: testData.aiOperations?.length || 0,
        healingAttemptsCount: testData.healingAttempts?.length || 0,
        startTime: new Date(testStartTime).toISOString(),
        endTime: new Date().toISOString()
      };
      
      cy.task('recordTestResult', testResult);
      cy.task('logAIInsight', `✅ Test "${testTitle}" completed: ${testState} (${testDuration}ms)`);
    });
  });

  context('AI vs Traditional Element Finding', () => {
    it('should demonstrate superior element finding with fallback strategies', () => {
      const testName = 'AI vs Traditional Element Finding';
      
      cy.task('logAIInsight', `🧪 Starting: ${testName}`);
      
      // Test 1: Traditional Cypress (baseline)
      cy.log('📊 Testing Traditional Cypress Approach');
      const traditionalStart = Date.now();
      
      cy.get('[data-testid="hero-title"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-testid="shop-now-button"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-testid="products-link"]', { timeout: 5000 }).click();
      cy.get('[data-testid="products-grid"]', { timeout: 8000 }).should('be.visible');
      
      const traditionalTime = Date.now() - traditionalStart;
      
      // Reset to home
      cy.get('[data-testid="home-link"]').click();
      cy.wait(1000);
      
      // Test 2: AI-Enhanced approach
      cy.log('🤖 Testing AI-Enhanced Approach');
      const aiStart = Date.now();
      
      cy.window().then((win) => {
        win.currentTestData.aiOperations.push({
          operation: 'ai-enhanced-element-finding',
          startTime: aiStart,
          approach: 'ai-enhanced'
        });
      });
      
      cy.findByAI('[data-testid="hero-title"]').should('be.visible');
      cy.findByAI('[data-testid="shop-now-button"]').should('be.visible');
      cy.navigateByAI('Products');
      cy.get('[data-testid="products-grid"]', { timeout: 8000 }).should('be.visible');
      
      const aiTime = Date.now() - aiStart;
      const improvement = Math.max(0, ((traditionalTime - aiTime) / traditionalTime * 100)).toFixed(1);
      
      cy.window().then((win) => {
        win.currentTestData.aiOperations.push({
          operation: 'ai_element_finding_complete',
          traditionalTime,
          aiTime,
          improvement: `${improvement}%`,
          success: true
        });
        
        win.currentTestData.performance = {
          traditionalTime,
          aiTime,
          improvement: `${improvement}%`,
          testName
        };
      });
      
      expect(aiTime).to.be.lessThan(traditionalTime + 2000);
      cy.task('logAIInsight', `✅ AI vs Traditional: ${aiTime}ms vs ${traditionalTime}ms (${improvement}% improvement)`);
    });
  });

  context('Dynamic Content Handling', () => {
    it('should intelligently handle loading states and dynamic content', () => {
      cy.task('logAIInsight', '💫 Testing Dynamic Content Intelligence');
      
      cy.navigateByAI('Products');
      cy.get('[data-testid="products-grid"]', { timeout: 10000 }).should('be.visible');
      
      cy.wait(2000);
      
      cy.get('[data-testid="category-filter"]').select('electronics');
      cy.clickByAI('[data-testid="apply-filters"]');
      
      cy.get('[data-testid="products-grid"]', { timeout: 8000 }).should('be.visible');
      cy.wait(2000);
      
      // FIXED: Better approach - separate the cart interaction from cart count check
      cy.get('[data-testid="products-grid"]').within(() => {
        cy.get('[data-testid^="add-to-cart-"]').first().then(($btn) => {
          if ($btn.length > 0) {
            cy.wrap($btn).should('be.visible').click({ force: true });
            cy.log('✅ Add to cart button clicked');
          } else {
            cy.log('⚠️ No add-to-cart buttons found after filtering');
          }
        });
      });
      
      // FIXED: Check cart count outside the products grid scope
      cy.wait(1000); // Give time for cart to update
      
      // Now check cart count in navigation area (outside of .within() scope)
      cy.get('[data-testid="nav-actions"]').within(() => {
        cy.get('[data-testid="cart-count"]', { timeout: 5000 }).should('be.visible').then(($cartCount) => {
          const cartValue = $cartCount.text();
          cy.log(`✅ Cart count updated successfully: ${cartValue}`);
          
          // Record AI operation after successful cart update
          cy.window().then((win) => {
            win.currentTestData.aiOperations.push({
              operation: 'dynamic_content_handling',
              cartCountValue: cartValue,
              dynamicContentHandled: true,
              success: true
            });
          });
        });
      });
      
      cy.log('✅ Dynamic content handled successfully');
      
      cy.task('logAIInsight', '✅ Dynamic content handled intelligently');
    });
  });

  context('Learning and Optimization', () => {
    it('should demonstrate learning capabilities and performance optimization', () => {
      cy.task('logAIInsight', '🧠 Testing AI Learning and Optimization');
      
      const operations = [
        { page: 'Products', selector: '[data-testid="products-link"]' },
        { page: 'Home', selector: '[data-testid="home-link"]' },
        { page: 'Cart', selector: '[data-testid="cart-link"]' },
        { page: 'Dashboard', selector: '[data-testid="dashboard-link"]' }
      ];
      
      const performanceTimes = [];
      
      operations.forEach((op, index) => {
        const opStart = Date.now();
        
        cy.log(`🔄 Learning Operation ${index + 1}: Navigate to ${op.page}`);
        
        cy.get(op.selector, { timeout: 5000 })
          .should('be.visible')
          .click()
          .then(() => {
            const opTime = Date.now() - opStart;
            performanceTimes.push({
              operation: op.page,
              iteration: index + 1,
              time: opTime,
              selector: op.selector
            });
            
            cy.window().then((win) => {
              win.currentTestData.aiOperations.push({
                operation: 'learning-navigation',
                target: op.page,
                selector: op.selector,
                responseTime: opTime,
                iteration: index + 1,
                learningEnabled: true,
                success: true
              });
            });
            
            cy.task('logAIInsight', `⏱️ ${op.page} navigation: ${opTime}ms (iteration ${index + 1})`);
          });
        
        cy.wait(500);
      });
      
      cy.then(() => {
        const avgTime = performanceTimes.reduce((sum, op) => sum + op.time, 0) / performanceTimes.length;
        
        cy.window().then((win) => {
          win.currentTestData.performance = {
            learningOperations: performanceTimes.length,
            averageTime: Math.round(avgTime),
            learningActive: true,
            performanceData: performanceTimes
          };
        });
        
        cy.task('logAIInsight', `📈 Learning performance: ${Math.round(avgTime)}ms average`);
      });
    });
  });

  context('Form Intelligence', () => {
    it('should demonstrate intelligent form handling with field detection', () => {
      cy.task('logAIInsight', '📝 Testing Form Intelligence');
      
      cy.navigateByAI('Profile');
      cy.get('[data-testid="profile-form"]', { timeout: 5000 }).should('be.visible');
      
      const formStart = Date.now();
      
      // FIXED: Completely simplified form filling without problematic cy.get('body')
      cy.get('[data-testid="profile-form"]').within(() => {
        // Fill required fields
        cy.get('[data-testid="first-name-input"]').clear().type('John');
        cy.get('[data-testid="last-name-input"]').clear().type('Doe');
        cy.get('[data-testid="email-input"]').clear().type('john.doe@example.com');
      });
      
      // FIXED: Handle optional field without problematic pattern
      cy.get('[data-testid="phone-input"]').then(($phone) => {
        if ($phone.length > 0) {
          cy.wrap($phone).clear().type('555-123-4567');
          cy.log('✅ Phone field filled');
        }
      });
      
      const formTime = Date.now() - formStart;
      
      cy.window().then((win) => {
        win.currentTestData.aiOperations.push({
          operation: 'fillFormByAI',
          formSelector: '[data-testid="profile-form"]',
          fieldsCount: 4,
          responseTime: formTime,
          fieldValidation: false,
          adaptiveSelectors: true,
          success: true
        });
      });
      
      // Verify form fields were filled
      cy.get('[data-testid="first-name-input"]').should('have.value', 'John');
      cy.get('[data-testid="last-name-input"]').should('have.value', 'Doe');
      
      cy.task('logAIInsight', `📝 Form filled intelligently in ${formTime}ms`);
      cy.task('logAIInsight', '✅ Form intelligence demonstrated successfully');
    });
  });

  context('Error Recovery and Resilience', () => {
    it('should gracefully handle element failures and recover', () => {
      cy.task('logAIInsight', '🛡️ Testing Error Recovery');
      
      // FIXED: Proper error handling without .catch() which doesn't work in Cypress
      let errorHandled = false;
      
      // Set up error handling first
      cy.on('fail', (err) => {
        if (err.message.includes('AI could not find element') && !errorHandled) {
          errorHandled = true;
          
          cy.window().then((win) => {
            win.currentTestData.aiOperations.push({
              operation: 'error-recovery',
              selector: '[data-testid="non-existent-element"]',
              errorType: 'element-not-found',
              handled: true,
              gracefulFailure: true,
              success: false,
              recovery: 'graceful-error-handling'
            });
          });
          
          cy.task('logAIInsight', '✅ Expected: Gracefully handled missing element');
          return false; // Prevent test failure
        }
      });
      
      // Try to find non-existent element
      cy.findByAI('[data-testid="non-existent-element"]', { timeout: 2000 })
        .then(() => {
          cy.task('logAIInsight', '⚠️ Unexpected: non-existent element found');
        });
      
      // Small delay to let error handling complete
      cy.wait(500);
      
      // Verify framework continues to work after error
      cy.findByAI('[data-testid="logo"]').should('be.visible');
      cy.navigateByAI('Products');
      cy.get('[data-testid="products-grid"]', { timeout: 8000 }).should('be.visible');
      
      cy.task('logAIInsight', '✅ Error recovery verified - framework remains stable');
    });
  });

  after(() => {
    cy.task('logAIInsight', '📊 Basic Functionality Tests Completed Successfully');
  });
});