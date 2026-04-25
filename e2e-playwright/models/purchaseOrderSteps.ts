import { PageObjectModel } from "./pageObjectModel";
import { Locator, Page, expect } from '@playwright/test';

export class PurchaseOrderSteps extends PageObjectModel {

  // Header and navigation locators
  backButton: Locator;
  createPoTitle: Locator;
  transactionId: Locator;
  status: Locator;
  paymentStatus: Locator;
  
  // Action buttons
  payButton: Locator;
  shareButton: Locator;
  copyButton: Locator;
  convertToInvoiceButton: Locator;
  downloadButton: Locator;
  deleteButton: Locator;
  emailButton: Locator;
  saveDraftButton: Locator;
  placeOrderButton: Locator;
  refreshButton: Locator;
  notifyButton: Locator;

  // UOM Settings
  uomSettingButton: Locator;
  uomCard: Locator;

  // Tab navigation
  purchaseOrderTab: Locator;
  paymentTab: Locator;

  // Purchase Order Details section
  selectVendor: Locator;
  vendorAddressButton: Locator;
  vendorAddressTooltip: Locator;
  incoTermsSelect: Locator;
  deliveryTypeSelect: Locator;
  localTypeButton: Locator;
  containerTypeButton: Locator;
  requiredDate: Locator;
  expectedShipDate: Locator;
  buyingTypeSelect: Locator;
  departurePortSelect: Locator;
  shippingVia: Locator;
  purchaseManagerSelect: Locator;
  dadyinPoints: Locator;
  loadingTypeSelect: Locator;
  paymentTermsSelect: Locator;
  poTemplateSelect: Locator;
  poNumber: Locator;
  date: Locator;
  expiryDate: Locator;
  refQuotation: Locator;
  quotationAutocomplete: Locator;

  // Product Details section
  productDetailsSection: Locator;
  prevOrdersButton: Locator;
  myCategoryButton: Locator;
  myFavouriteButton: Locator;
  productPackagesTable: Locator;

  constructor(page: Page) {
    super(page);

    // Header and navigation locators
    this.backButton = this.page.locator('dadyin-button[ng-reflect-theme="borderless-primary"]').first();
    this.createPoTitle = this.page.locator('.content-title label');
    this.transactionId = this.page.locator('b.text-black');
    this.status = this.page.locator('.status.font-size-12');
    this.paymentStatus = this.page.locator('.font-size-10');

    // Action buttons
    this.payButton = this.page.locator('dadyin-button[matTooltip="Pay"]');
    this.shareButton = this.page.locator('dadyin-button[matTooltip="Share"]');
    this.copyButton = this.page.locator('dadyin-button[matTooltip="Copy this Transaction"]');
    this.convertToInvoiceButton = this.page.locator('dadyin-button[matTooltip="Convert To Invoice"]');
    this.downloadButton = this.page.locator('dadyin-button[matTooltip="Download"]');
    this.deleteButton = this.page.locator('dadyin-button[matTooltip="Delete"]');
    this.emailButton = this.page.locator('dadyin-button[matTooltip="Email Transaction (Regular or Tier)"]');
    this.saveDraftButton = this.page.locator('dadyin-button[matTooltip="Save this in Draft"]');
    this.placeOrderButton = this.page.locator('dadyin-button[matTooltip="Place Order"]');
    this.refreshButton = this.page.locator('dadyin-button[matTooltip="Refresh Updated Purchase order information"]');
    this.notifyButton = this.page.locator('dadyin-button[matTooltip="Notify"]');

    // UOM Settings
    this.uomSettingButton = this.page.locator('button.bg-primary-light.title-text');
    this.uomCard = this.page.locator('.card.uom-card');

    // Tab navigation
    this.purchaseOrderTab = this.page.locator('mat-tab[label="Purchase order"]');
    this.paymentTab = this.page.locator('mat-tab[label="Payment"]');

    // Purchase Order Details section
    this.selectVendor = this.page.locator('dadyin-searchable-select[label="Select Vendor"]');
    this.vendorAddressButton = this.page.locator('dadyin-button[ng-reflect-typeval="assets/img/icons/address.png"]');
    this.vendorAddressTooltip = this.page.locator('.tooltip-white.b-light.shadow-sm');
    this.incoTermsSelect = this.page.locator('dadyin-select[label="Inco Terms"]');
    this.deliveryTypeSelect = this.page.locator('dadyin-select[label="Delivery Type"]');
    this.localTypeButton = this.page.locator('dadyin-button[ng-reflect-typeval*="location"]');
    this.containerTypeButton = this.page.locator('dadyin-button[ng-reflect-typeval*="anchor"]');
    this.requiredDate = this.page.locator('dadyin-input[label="Required Date"] input');
    this.expectedShipDate = this.page.locator('dadyin-input[label="Expected Ship Date"] input');
    this.buyingTypeSelect = this.page.locator('dadyin-select[label="Buying Type"]');
    this.departurePortSelect = this.page.locator('dadyin-select[label="Port of Departure"]');
    this.shippingVia = this.page.locator('dadyin-input[label="Shipping via"] input');
    this.purchaseManagerSelect = this.page.locator('dadyin-select[label="Purchase manager"]');
    this.dadyinPoints = this.page.locator('dadyin-input[label="Dadyin Points"] input');
    this.loadingTypeSelect = this.page.locator('dadyin-select[label="Loading Type"]');
    this.paymentTermsSelect = this.page.locator('dadyin-select[label="Payment Terms"]');
    this.poTemplateSelect = this.page.locator('dadyin-select[label="PO Temp"]');
    this.poNumber = this.page.locator('dadyin-input[label="PO #"] input');
    this.date = this.page.locator('dadyin-input[label="Date"] input');
    this.expiryDate = this.page.locator('dadyin-input[label="Expires on"] input');
    this.refQuotation = this.page.locator('input[matAutocomplete]');
    this.quotationAutocomplete = this.page.locator('mat-autocomplete mat-option');

    // Product Details section
    this.productDetailsSection = this.page.locator('mat-expansion-panel:has(.title-text:text("Product Details"))');
    this.prevOrdersButton = this.page.locator('.bg-card-header:has(.text-dark:text("Prev. Orders"))');
    this.myCategoryButton = this.page.locator('.bg-card-header:has(.text-dark:text("My Category"))');
    this.myFavouriteButton = this.page.locator('.bg-card-header:has(.text-dark:text("My Favourite"))');
    this.productPackagesTable = this.page.locator('app-order-transaction-packages');
  }

  // Method to fill purchase order details
  async fillPurchaseOrderDetails(orderData: any) {
    // Select vendor
    if (orderData.requestTo?.id) {
      await this.selectVendor.click();
      // For ng-select, use ng-option with value or text content
      await this.page.locator(`ng-option[ng-reflect-value="${orderData.requestTo.id}"]`).click();
    }

    // Set delivery type if LOCAL
    if (orderData.importLocalType === 'LOCAL' && orderData.deliveryPickup) {
      await this.deliveryTypeSelect.click();
      await this.page.locator(`ng-option[ng-reflect-value="${orderData.deliveryPickup}"]`).click();
    }

    // Set inco terms if CONTAINER
    if (orderData.importLocalType === 'CONTAINER' && orderData.incoTermId) {
      await this.incoTermsSelect.click();
      await this.page.locator(`ng-option[ng-reflect-value="${orderData.incoTermId}"]`).click();
    }

    // Toggle between LOCAL and CONTAINER
    if (orderData.importLocalType === 'LOCAL') {
      await this.localTypeButton.click();
    } else if (orderData.importLocalType === 'CONTAINER') {
      await this.containerTypeButton.click();
    }

    // Fill date fields
    if (orderData.requiredByDate) {
      await this.requiredDate.fill(orderData.requiredByDate);
    }
    if (orderData.expectedByDate) {
      await this.expectedShipDate.fill(orderData.expectedByDate);
    }

    // Select buying type
    if (orderData.buyingType) {
      await this.buyingTypeSelect.click();
      await this.page.locator(`ng-option[ng-reflect-value="${orderData.buyingType}"]`).click();
    }

    // Fill other fields
    if (orderData.departurePortId) {
      await this.departurePortSelect.click();
      await this.page.locator(`ng-option[ng-reflect-value="${orderData.departurePortId}"]`).click();
    }
    if (orderData.shipper) {
      await this.shippingVia.fill(orderData.shipper);
    }
    if (orderData.purchaseManagerId) {
      await this.purchaseManagerSelect.click();
      await this.page.locator(`ng-option[ng-reflect-value="${orderData.purchaseManagerId}"]`).click();
    }
    if (orderData.dadyInPoints) {
      await this.dadyinPoints.fill(orderData.dadyInPoints.toString());
    }
    if (orderData.loadingTypeId) {
      await this.loadingTypeSelect.click();
      await this.page.locator(`ng-option[ng-reflect-value="${orderData.loadingTypeId}"]`).click();
    }
    if (orderData.paymentTermId) {
      await this.paymentTermsSelect.click();
      await this.page.locator(`ng-option[ng-reflect-value="${orderData.paymentTermId}"]`).click();
    }

    // Fill PO details
    if (orderData.transactionId) {
      await this.poNumber.fill(orderData.transactionId);
    }
    if (orderData.date) {
      await this.date.fill(orderData.date);
    }
    if (orderData.expiryDate) {
      await this.expiryDate.fill(orderData.expiryDate);
    }
    if (orderData.referenceOrder?.quotationId) {
      await this.refQuotation.fill(orderData.referenceOrder.quotationId);
      await this.quotationAutocomplete.first().click();
    }
  }

  // Method to add products to the order
  async addProductsToOrder(productPackages: any[]) {
    for (const product of productPackages) {
      // Click on product search or add product functionality
      // This would depend on the specific implementation of the product selection
      await this.productDetailsSection.click();
      
      // Search for product
      const productSearch = this.page.locator('input[placeholder*="Search"]').first();
      if (productSearch.isVisible()) {
        await productSearch.fill(product.productDetails?.description || '');
        await this.page.waitForTimeout(1000);
      }

      // Select product from results
      const productOption = this.page.locator(`[data-product-id="${product.productId}"]`).first();
      if (await productOption.isVisible()) {
        await productOption.click();
      }

      // Set quantity
      if (product.quantity) {
        const quantityInput = this.page.locator(`input[ng-reflect-name="quantity"]`).last();
        await quantityInput.fill(product.quantity.toString());
      }
    }
  }

  // Method to save as draft
  async saveAsDraft() {
    await this.saveDraftButton.click();
    await this.page.waitForTimeout(2000);
  }

  // Method to place order
  async placeOrder() {
    await this.placeOrderButton.click();
    await this.page.waitForTimeout(2000);
  }

  // Method to calculate values
  async calculateValues() {
    // This would trigger the calculation - might be automatic or need a button click
    await this.page.waitForTimeout(1000);
  }

  // Method to verify order details
  async verifyOrderDetails(orderData: any) {
    // Verify transaction ID
    if (orderData.transactionId) {
      await expect(this.transactionId).toContainText(orderData.transactionId);
    }

    // Verify status
    if (orderData.status) {
      await expect(this.status).toContainText(orderData.status);
    }

    // Verify payment status
    if (orderData.paymentStatus) {
      await expect(this.paymentStatus).toContainText(orderData.paymentStatus);
    }
  }

  // Method to navigate to payment tab
  async navigateToPaymentTab() {
    await this.paymentTab.click();
    await this.page.waitForTimeout(1000);
  }

  // Method to open UOM settings
  async openUOMSettings() {
    await this.uomSettingButton.click();
    await expect(this.uomCard).toBeVisible();
  }

  // Method to close UOM settings
  async closeUOMSettings() {
    await this.uomSettingButton.click();
    await expect(this.uomCard).not.toBeVisible();
  }

  // Method to use previous orders
  async usePreviousOrders() {
    await this.prevOrdersButton.click();
    await this.page.waitForTimeout(1000);
  }

  // Method to use my category
  async useMyCategory() {
    await this.myCategoryButton.click();
    await this.page.waitForTimeout(1000);
  }

  // Method to use my favourites
  async useMyFavourites() {
    await this.myFavouriteButton.click();
    await this.page.waitForTimeout(1000);
  }

  // Method to delete order
  async deleteOrder() {
    await this.deleteButton.click();
    // Handle confirmation dialog if it appears
    const confirmDialog = this.page.locator('mat-dialog-container');
    if (await confirmDialog.isVisible()) {
      await this.page.locator('button:has-text("Yes")').click();
    }
  }

  // Method to convert to invoice
  async convertToInvoice() {
    await this.convertToInvoiceButton.click();
    await this.page.waitForTimeout(2000);
  }

  // Method to refresh order
  async refreshOrder() {
    await this.refreshButton.click();
    await this.page.waitForTimeout(2000);
  }

  // Method to generate PDF
  async generatePDF() {
    // This would trigger PDF generation - implementation depends on the specific button
    await this.page.waitForTimeout(1000);
  }

  // Method to verify product packages
  async verifyProductPackages(expectedCount: number) {
    const productRows = this.page.locator('app-order-transaction-packages tr');
    await expect(productRows).toHaveCount(expectedCount);
  }

  // Method to verify order totals
  async verifyOrderTotals(orderData: any) {
    if (orderData.cost?.attributeValue) {
      const costElement = this.page.locator(`[data-testid="total-cost"]`);
      await expect(costElement).toContainText(orderData.cost.attributeValue.toString());
    }
    
    if (orderData.totalCost?.attributeValue) {
      const totalCostElement = this.page.locator(`[data-testid="total-cost"]`);
      await expect(totalCostElement).toContainText(orderData.totalCost.attributeValue.toString());
    }
  }
}
