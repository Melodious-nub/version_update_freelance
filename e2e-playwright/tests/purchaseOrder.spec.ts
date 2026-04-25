import { test, expect } from '@playwright/test';
import { PurchaseOrderSteps } from '../models/purchaseOrderSteps';
import { HomePage } from '../models/homePage';
import { LoginPage } from '../models/login';
import { getTestData, setTestData, getPurchaseOrderTestData } from '../utils/helper';
import { CommonPage } from '../models/common';
import { EnvironmentManager } from '../utils/environmentManager';

test.describe.serial('Purchase Order Tests', () => {
  let commonPage: CommonPage;
  let purchaseOrderPage: PurchaseOrderSteps;
  let loginPage: LoginPage;
  let homePage: HomePage;
  let data: any;
  let loginCreds: any;
  let envManager: EnvironmentManager;

  test.beforeAll(async () => {
    envManager = EnvironmentManager.getInstance();
    loginCreds = envManager.getLoginCredentials();
    setTestData();
  });

  test.beforeEach(async ({ page }) => {
    commonPage = new CommonPage(page);
    purchaseOrderPage = new PurchaseOrderSteps(page);
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);
  });

  // Shared login and navigation setup
  async function setupTest() {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
  }

  test('Create New Purchase Order - Local Delivery', async () => {
    // Setup login and navigation
    await setupTest();
    
    // Navigate to create purchase order
    await commonPage.navigateToCreatePurchaseOrder();
    
    // Get test data
    data = getPurchaseOrderTestData();
    const orderData = data.testScenarios[0].data;
    
    // Fill purchase order details
    await purchaseOrderPage.fillPurchaseOrderDetails(orderData);
    
    // Add products to the order
    await purchaseOrderPage.addProductsToOrder(orderData.productPackages);
    
    // Calculate values
    await purchaseOrderPage.calculateValues();
    
    // Verify order details
    await purchaseOrderPage.verifyOrderDetails(orderData);
    
    // Save as draft
    await purchaseOrderPage.saveAsDraft();
    
    // Verify success message or navigation
    await expect(purchaseOrderPage.page.locator('text=Saved Successfully')).toBeVisible();
  });

  test('Create Container Purchase Order', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to create purchase order
    await commonPage.navigateToCreatePurchaseOrder();
    
    // Get test data
    data = getTestData();
    const orderData = data.purchaseOrder.testScenarios[1].data;
    
    // Fill purchase order details
    await purchaseOrderPage.fillPurchaseOrderDetails(orderData);
    
    // Add products to the order
    await purchaseOrderPage.addProductsToOrder(orderData.productPackages);
    
    // Calculate values
    await purchaseOrderPage.calculateValues();
    
    // Verify order details
    await purchaseOrderPage.verifyOrderDetails(orderData);
    
    // Save as draft
    await purchaseOrderPage.saveAsDraft();
    
    // Verify success message or navigation
    await expect(purchaseOrderPage.page.locator('text=Saved Successfully')).toBeVisible();
  });

  test('Edit Existing Purchase Order', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to edit existing purchase order
    await commonPage.navigateToEditPurchaseOrder('820');
    
    // Get test data
    data = getTestData();
    const orderData = data.purchaseOrder.testScenarios[2].data;
    
    // Verify existing order details
    await purchaseOrderPage.verifyOrderDetails(orderData);
    
    // Update order details
    await purchaseOrderPage.fillPurchaseOrderDetails(orderData);
    
    // Update products in the order
    await purchaseOrderPage.addProductsToOrder(orderData.productPackages);
    
    // Calculate values
    await purchaseOrderPage.calculateValues();
    
    // Save changes
    await purchaseOrderPage.saveAsDraft();
    
    // Verify success message
    await expect(purchaseOrderPage.page.locator('text=Saved Successfully')).toBeVisible();
  });

  test('Place Purchase Order', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to create purchase order
    await commonPage.navigateToCreatePurchaseOrder();
    
    // Get test data
    data = getPurchaseOrderTestData();
    const orderData = data.testScenarios[0].data;
    
    // Fill purchase order details
    await purchaseOrderPage.fillPurchaseOrderDetails(orderData);
    
    // Add products to the order
    await purchaseOrderPage.addProductsToOrder(orderData.productPackages);
    
    // Calculate values
    await purchaseOrderPage.calculateValues();
    
    // Place order
    await purchaseOrderPage.placeOrder();
    
    // Verify success message
    await expect(purchaseOrderPage.page.locator('text=Order Placed Successfully')).toBeVisible();
  });

  test('Use Previous Orders', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to create purchase order
    await commonPage.navigateToCreatePurchaseOrder();
    
    // Use previous orders
    await purchaseOrderPage.usePreviousOrders();
    
    // Verify that products are loaded from previous orders
    await expect(purchaseOrderPage.productPackagesTable).toBeVisible();
  });

  test('Use My Category Products', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to create purchase order
    await commonPage.navigateToCreatePurchaseOrder();
    
    // Use my category
    await purchaseOrderPage.useMyCategory();
    
    // Verify that products are loaded from my category
    await expect(purchaseOrderPage.productPackagesTable).toBeVisible();
  });

  test('Use My Favourite Products', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to create purchase order
    await commonPage.navigateToCreatePurchaseOrder();
    
    // Use my favourites
    await purchaseOrderPage.useMyFavourites();
    
    // Verify that products are loaded from favourites
    await expect(purchaseOrderPage.productPackagesTable).toBeVisible();
  });

  test('UOM Settings', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to create purchase order
    await commonPage.navigateToCreatePurchaseOrder();
    
    // Open UOM settings
    await purchaseOrderPage.openUOMSettings();
    
    // Verify UOM card is visible
    await expect(purchaseOrderPage.uomCard).toBeVisible();
    
    // Close UOM settings
    await purchaseOrderPage.closeUOMSettings();
    
    // Verify UOM card is hidden
    await expect(purchaseOrderPage.uomCard).not.toBeVisible();
  });

  test('Delete Purchase Order', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to edit existing purchase order
    await commonPage.navigateToEditPurchaseOrder('820');
    
    // Delete the order
    await purchaseOrderPage.deleteOrder();
    
    // Verify success message
    await expect(purchaseOrderPage.page.locator('text=Successfully Deleted')).toBeVisible();
  });

  test('Convert Purchase Order to Invoice', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to edit existing purchase order with CONFIRMED status
    await commonPage.navigateToEditPurchaseOrder('820');
    
    // Convert to invoice
    await purchaseOrderPage.convertToInvoice();
    
    // Verify success message
    await expect(purchaseOrderPage.page.locator('text=Converted Successfully')).toBeVisible();
  });

  test('Refresh Purchase Order', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to edit existing purchase order
    await commonPage.navigateToEditPurchaseOrder('820');
    
    // Refresh the order
    await purchaseOrderPage.refreshOrder();
    
    // Verify success message
    await expect(purchaseOrderPage.page.locator('text=Refresh Successfully')).toBeVisible();
  });

  test('Verify Order Totals', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to edit existing purchase order
    await commonPage.navigateToEditPurchaseOrder('820');
    
    // Get test data
    data = getPurchaseOrderTestData();
    const orderData = data.purchaseOrder;
    
    // Verify order totals
    await purchaseOrderPage.verifyOrderTotals(orderData);
  });

  test('Verify Product Packages', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to edit existing purchase order
    await commonPage.navigateToEditPurchaseOrder('820');
    
    // Get test data
    data = getPurchaseOrderTestData();
    const orderData = data.purchaseOrder;
    
    // Verify product packages count
    await purchaseOrderPage.verifyProductPackages(orderData.productPackages.length);
  });

  test('Navigate to Payment Tab', async () => {
    // Login to the application
    await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
    // Wait for the page to load completely
    await commonPage.page.waitForLoadState('networkidle');
    await commonPage.page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await commonPage.page.screenshot({ path: 'debug-after-login.png' });
    
    // Try to navigate to order management
    try {
      await commonPage.navigateToOrderManagement();
      console.log('Successfully navigated to order management');
    } catch (error) {
      console.log('Navigation failed:', error);
      // Take a screenshot for debugging
      await commonPage.page.screenshot({ path: 'debug-navigation-failed.png' });
      throw error;
    }
    
    // Wait for navigation to complete
    await commonPage.page.waitForLoadState('networkidle');
    
    // Navigate to edit existing purchase order with CONFIRMED status
    await commonPage.navigateToEditPurchaseOrder('820');
    
    // Navigate to payment tab
    await purchaseOrderPage.navigateToPaymentTab();
    
    // Verify payment tab is active
    await expect(purchaseOrderPage.paymentTab).toHaveAttribute('aria-selected', 'true');
  });
});
