import { PageObjectModel } from "./pageObjectModel";
import { Locator, Page, expect } from '@playwright/test';

export class CommonPage extends PageObjectModel {
// Common locators can be defined here
  menu: Locator;
  productManangement: Locator;
  productTemplates: Locator;
  product: Locator;
  addTemplate: Locator;
  orderManagement: Locator;
  purchaseOrders: Locator;
  createPurchaseOrder: Locator;

    constructor(page: Page) {
        super(page);
            this.menu = this.page.locator("mat-sidenav-content.img[alt='Logo']");
            //this.productManangement = this.page.locator("i.img[alt='Products management']")
            //this.productManangement = this.page.locator('input[ng-reflect-message="Products management"]')
            this.productManangement = this.page.getByRole('img', { name: 'Products management' })
            this.product = this.page.getByRole('link', { name: 'Products', exact: true })
            //this.productManangement = this.page.locator('mat-sidenav').getByText('Products', { exact: true })

            this.productTemplates = this.page.getByRole('link', { name: 'Products Templates' })
            this.orderManagement = this.page.getByRole('img', { name: 'Orders management' })
            this.purchaseOrders = this.page.getByRole('link', { name: 'Vendor', exact: true })
            this.createPurchaseOrder = this.page.getByRole('button', { name: 'Create PO' })
        }
        

    async navigateToProductManagement() {
       // await expect(this.menu).toBeVisible();
       // await this.menu.waitFor({ state: 'visible', timeout: 50000 });
       // await this.menu.click()
        //await this.page.waitForTimeout(6000);
        
        await this.productManangement.dblclick({ timeout: 600000 });
        await this.page.waitForTimeout(6000);
        await this.product.click()
        //await this.productManangement.click({ timeout: 600000 });
       // await this.productManangement.waitFor({ state: 'visible' });
 
       //await expect(this.productManangement).toBeVisible()
    }

    async navigateToTemplate(){
        await expect(this.menu).toBeVisible();
        await this.menu.waitFor({ state: 'visible', timeout: 50000 });
        await this.menu.click();
        await this.productManangement.click({ timeout: 600000 });
        await this.productTemplates.click();
        
    }

    async navigateToOrderManagement() {
        // Click on Orders management to expand the menu
        await this.orderManagement.click({ timeout: 30000 });
        await this.page.waitForTimeout(2000);
        
        // Click on Vendor submenu
        await this.purchaseOrders.click({ timeout: 30000 });
        await this.page.waitForTimeout(2000);
    }

    async navigateToCreatePurchaseOrder() {
        await this.createPurchaseOrder.click();
        await this.page.waitForTimeout(2000);
    }

    async navigateToEditPurchaseOrder(orderId: string) {
        await this.page.goto(`/home/order-management/vendor/purchaseorder/edit/${orderId}`);
        await this.page.waitForTimeout(2000);
    }
}