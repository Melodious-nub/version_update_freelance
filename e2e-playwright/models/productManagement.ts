import { PageObjectModel } from "./pageObjectModel";
import { Locator, Page, expect } from '@playwright/test';
import { generateUPC,generateEAN13 } from '../utils/helper';

export class Product extends PageObjectModel {

  // Locators for Product information section
  productDetailMenu: Locator;
  addProduct: Locator;
  productCode: Locator;
  productDescription: Locator;
  upcCode: Locator;
  eanCode: Locator;
  skuType: Locator;
  unitCount: Locator;
  unitName: Locator;
  selectProductType: Locator;
  selectProductSubType: Locator;
  purchaseDescription: Locator;

  // Locators for other details sections
  choosePreferedVendor: Locator; 
  customProductFor: Locator;
  sealable: Locator; 
  nonSealable: Locator;
  isFavourite: Locator; 
  isRawMaterial: Locator; 
  isSupplies: Locator; 
  isPackagingMaterial: Locator; 
  isCustomizable: Locator; 
  isQuickCheckoutEligible: Locator;
  purchase: Locator;
  price: Locator;

  // Locators for Product attributes section
  productAttributeInput: Locator;
  selectProductunit: Locator;
  productAttributes: Locator;
  productAttrAdd: Locator;
  USDMT: Locator;
  USDMTSelect: Locator;

  // Locators for Inventory section
  openingInventory:Locator;
  inventoryLocation:Locator;
  inventoryAddedBy: Locator;
  inventoryAddedOn: Locator;
  showLiveInventory: Locator;
  showGreaterThan: Locator;
  greaterThanQty: Locator;
  customInventoryType: Locator;  
  inventorySelect:Locator;
  inventory: Locator;

  //Locators for Product pricing section
  templateCost: Locator;
  templateCostValue: Locator;
  templateDensityValue: Locator;


  // Locators for Package Details section
  packageAttributes: Locator;
  packageDetails: Locator;
  skuPackage: Locator;
  skuUnit: Locator;
  yesButton: Locator;
  mqoBulk: Locator;
  mqoCustom: Locator;
  mqs: Locator;
  delete: Locator;
  stackableYes: Locator;
  stackableNo: Locator;
  productConsidered: Locator
  addNewPackage: Locator;

// Locators for Pricing Details section
  pricingDetails: Locator;
  unitBuyerMargin: Locator;
  unitBuyerDecimal: Locator;
  skuBuyerMargin: Locator;
  skuBuyerDecimal: Locator;
  palletBuyerMargin: Locator;
  palletBuyerDecimal: Locator;
  containerBuyerMargin: Locator;
  containerBuyerDecimal: Locator; 

//Locator sample
  width: Locator; 
  sideGusset: Locator; 
  length: Locator; 

  thickness: Locator;
  gsm: Locator;
  cutWate: Locator;
  surfaceArea: Locator; 

  netCost: Locator;
  netWeight: Locator; 
  unit: Locator;

// Locators for Other Details section
  otherDetails: Locator;
  addKeyword: Locator;
  addKeywordInput: Locator;

// Locators for Product header section
  saveProduct: Locator;
  publish: Locator;

  constructor(page: Page) {
    super(page);

    this.addProduct = this.page.getByRole('button', { name: 'Add Product' });

    // Locators for Product information section
    this.productDetailMenu = this.page.getByText('Product Details');
    this.productCode = this.page.locator('input[ng-reflect-name="productCode"]');
    this.productDescription = this.page.locator('input[ng-reflect-name="description"]')
    this.upcCode = this.page.locator('input[ng-reflect-name="upcCode"]');
    this.eanCode = this.page.locator('input[ng-reflect-name="eanCode"]');    
    this.skuType = this.page.locator('select[ng-reflect-name="skuName"]');
    this.unitCount = this.page.locator('input[ng-reflect-name="unitCount"]');
    this.unitName = this.page.locator('input[ng-reflect-name="unitName"]');
    this.selectProductType = this.page.locator('input#yesno').first();
    this.selectProductSubType = this.page.locator('input#yesno').nth(1);
    this.purchaseDescription = this.page.locator('input[ng-reflect-name="purchaseDescription"]');

    // Locators for other details sections
    this.choosePreferedVendor = this.page.locator('input#yesno').nth(2);
    this.customProductFor = this.page.locator('input#yesno').nth(2);
    this.sealable = this.page.locator('button').filter({ hasText: ' Saleable ' }).first();
    this.nonSealable = this.page.locator('button').filter({ hasText: ' Non-Saleable ' }).first();
    this.isFavourite = this.page.locator('#isFavourite')
    this.isRawMaterial = this.page.locator('#isRawMaterial')
    this.isSupplies = this.page.locator('#isSupplies')
    this.isPackagingMaterial = this.page.locator('#isPackagingMaterial')
    this.isCustomizable = this.page.locator('input[ng-reflect-name="isCustomizable"]')
    this.isQuickCheckoutEligible = this.page.locator('input[ng-reflect-name="isQuickCheckoutEligible"]')
    
    // Locators for Product attributes section
    this.productAttributes = this.page.locator('input[ng-reflect-name="isProductAttributes"]');
    this.selectProductunit = this.page.locator('input#yesno').nth(4);
    this.productAttrAdd = this.page.locator('dadyin-button[ng-reflect-label="Add"]').nth(1);
    this.USDMT = this.page.locator('label').filter({hasText: ' USD/MT'}).first().locator('..').locator('input');
    this.USDMTSelect = this.page.locator('label').filter({hasText: ' USD/MT'}).first().locator('..').locator('select');
    this.delete = this.page.getByRole('button', { name: 'SKU Package 1 : Select' }).getByRole('button')

    // Locators for Inventory section
    this.inventory = this.page.locator('input[ng-reflect-name="isInventoryListed"]')
    this.openingInventory=this.page.locator('input[ng-reflect-name="openingInventory"]')
    this.inventorySelect  = this.page.locator('select[ng-reflect-name="inventoryType"]')
	  this.inventoryLocation =this.page.locator('input[ng-reflect-name="inventoryLocation"]')
    this.inventoryAddedBy =this.page.locator('input[ng-reflect-name="inventoryAddedBy"]')
    this.inventoryAddedOn =this.page.locator('input[name=inventoryAddedOn]')
    this.showLiveInventory = this.page.locator('button').filter({ hasText: ' Show Live Inventory ' }).first();
    this.showGreaterThan = this.page.locator('button').filter({ hasText: ' Show greater than ' }).first();
    this.greaterThanQty =this.page.locator('input[ng-reflect-name="customInventoryValue"]')
    this.customInventoryType =this.page.locator('select[ng-reflect-name="customInventoryType"]')       

    // Locators for Package Details section
    this.packageAttributes = this.page.locator('input[ng-reflect-name="isPackageAttributes"]');
    //this.packageDetails = this.page.locator('button').filter({ hasText: 'Package Details' }).first();
    this.packageDetails = this.page.getByText('Package Details');
    //this.skuPackage = this.page.locator('text=SKU Package 1 : PALLET >> input[type="checkbox"]');
    //this.skuPackage = this.page.locator('input[ng-reflect-name="isSku"]')
    this.skuPackage = this.page.getByRole('checkbox', { name: 'SKU SKU' });
    this.yesButton = this.page.getByRole('button', { name: 'Yes' });
    this.mqoBulk = this.page.locator('label').filter({hasText: 'MQO (Bulk/Container)'}).first().locator('..').locator('input');
    this.mqoCustom = this.page.locator('label').filter({hasText: 'MQO (Custom)'}).first().locator('..').locator('input');
    this.mqs = this.page.locator('label').filter({hasText: 'MQS'}).first().locator('..').locator('input');
    this.stackableYes = this.page.getByRole('button', { name: 'Yes' });
    this.stackableNo = this.page.getByRole('button', { name: 'No' });
    this.productConsidered = this.page.getByRole('button', { name: 'SKU Product : Considered' })
    this.addNewPackage = this.page.getByRole('button', { name: 'Add New Package' });

    //locators for template
    this.templateCost = this.page.locator('strong', { hasText: 'Template Cost :' });
    this.templateDensityValue = this.page.locator('div.primary-text:has(strong:text("Template Density :")) span')
    this.templateCostValue = this.page.locator('div.primary-text:has(strong:text("Template Cost :")) span.price-text')

    //
  this.width = this.page.getByText('Width')
  this.sideGusset = this.page.getByText('Side Gusset')
  this.length = this.page. getByText('Length')

  this.thickness = this.page.getByText('Thickness (Micron)')
  this.gsm=this.page.getByText('GSM')
  this.cutWate= this.page.getByText('Cut Waste')
  this.surfaceArea = this.page.getByText('Surface Area', { exact: true })

  this.netCost = this.page.getByText('Net Cost')
  this.netWeight = this.page.getByText('Net Weight')
  this.unit= this.page.getByText('Unit / Kg')
    
    // Locators for Pricing Details section
    this.pricingDetails = this.page.getByRole('tab', { name: 'Pricing Details' });
    this.unitBuyerMargin = this.page.locator('input[ng-reflect-name="marginPercent"]').nth(0);
    this.unitBuyerDecimal = this.page.locator('input[ng-reflect-name="decimalValue"]').nth(0);
    this.skuBuyerMargin = this.page.locator('input[ng-reflect-name="marginPercent"]').nth(1);
    this.skuBuyerDecimal = this.page.locator('input[ng-reflect-name="decimalValue"]').nth(1);
    this.palletBuyerMargin = this.page.locator('input[ng-reflect-name="marginPercent"]').nth(2);
    this.palletBuyerDecimal = this.page.locator('input[ng-reflect-name="decimalValue"]').nth(2);
    this.containerBuyerMargin = this.page.locator('input[ng-reflect-name="marginPercent"]').nth(3);
    this.containerBuyerDecimal = this.page.locator('input[ng-reflect-name="decimalValue"]').nth(3);
    
    // Locators for Other Details section
    this.otherDetails = this.page.getByText('Other Details');
    this.addKeywordInput = this.page.getByRole('textbox', { name: 'Type keywords that you want' })
    this.addKeyword = this.page.getByRole('region', { name: 'Product Keywords' }).getByRole('button');
    
    // Locators for Product header section
    this.publish = this.page.getByRole('button', { name: 'Publish' });
    this.saveProduct = this.page.getByRole('button', { name: 'Save Draft' });

  }
  
  // Method to add product details
  async productDetails(productCode,productDescription,upcCode,eanCode,skuType,unitCount,unitName,
    selectProductType,selectProductSubType,purchaseDescription) {

   // await this.addProduct.waitFor({ state: 'visible', timeout: 15000 })
    await this.addProduct.click();
    
    await this.inventory.check();

    await this.productCode.fill(productCode);
    await this.productDescription.fill(productDescription);
    const upc = upcCode || generateUPC();
    await this.upcCode.fill(upc);
    const ean = eanCode || generateEAN13();
    await this.eanCode.fill(ean);  
    await this.skuType.selectOption(skuType);    

    await this.unitCount.fill(unitCount);
    await this.unitName.fill(unitName)


    await this.selectProductType.click();
    await this.page.locator('span').filter({ hasText: selectProductType }).first().click();

    await this.selectProductSubType.click();
    await this.page.locator('span').filter({ hasText: selectProductSubType }).first().click();
    
    await this.purchaseDescription.fill(purchaseDescription)

    await this.unitName.fill(unitName)
    //await expect(unitName).toBe(unitName);

  }

  // Method to fill other product details information
  async otherInfo(choosePreferedVendor,customProductFor,saleable,markasFavorite,
      isaRawMaterial,isaSupplies,isaPackaging,isCustomizable,displayInQuickCheckout){
    await this.productDetailMenu.click();
    await this.page.waitForTimeout(2000);
    await this.choosePreferedVendor.click()
    await this.page.locator('span').filter({ hasText: choosePreferedVendor }).first().click();
    
    if (customProductFor !== '') {
     // await this.customProductFor.click();
     // await this.page.locator('span').filter({ hasText: customProductFor }).first().click();
    }
    if (saleable === 'true') {
      await this.sealable.click();
    } //else {
     // await this.nonSealable.click();
   // }

    if(markasFavorite === 'true') {
      await this.isFavourite.check();
    }

    if (isaRawMaterial === 'true') {
      await this.isRawMaterial.check();
    }

    if (isaSupplies === 'true') {
      await this.isSupplies.check();
    }

    if (isaPackaging === 'true') {
    await this.isPackagingMaterial.check();
    } 

    if (isCustomizable === 'true') {
    await this.isCustomizable.check();
    }
   
    if (displayInQuickCheckout === 'true') {
    await this.isQuickCheckoutEligible.check();
    }

   /* await expect(this.width).toHaveText('Width');
    await expect(this.sideGusset).toHaveText('Side Gusset');
    await expect(this.length).toHaveText('Length');
    await expect(this.thickness).toHaveText('Thickness (Micron)');
    await expect(this.gsm).toHaveText('GSM');
    await expect(this.cutWate).toHaveText('Cut Waste');
    await expect(this.surfaceArea).toHaveText('Surface Area');
    await expect(this.netCost).toHaveText('Net Cost');
    await expect(this.netWeight).toHaveText('Net Weight');
    await expect(this.unit).toHaveText('Unit / Kg');*/

    }
    
  // Method to fill product attributes
   async productAttribute(productAttributes){
    //await this.productAttributes.scrollIntoViewIfNeeded();
    //await this.page.waitForTimeout(1000);
    //await this.productAttributes.hover();
    
    //await this.productAttributes.check();
    await this.page.waitForTimeout(2000);
    // Enter product attributes only if the productAttributes flag is set to 'true'
   if (productAttributes.productAttributes === 'true') {
      await this.productAttributes.check();
      await this.page.waitForTimeout(2000);
      console.log(productAttributes);

     const entries = Object.entries(productAttributes ?? {});    
       for (let i = 1; i < entries.length; i+=2) {
        const [pairKey1,pairValue1] = entries[i];
        const [pairKey2,pairValue2] = entries[i + 1] ||[];
        console.log('pair1:', pairKey1, pairValue1);
        console.log('pair2:', pairKey2, pairValue2);
        console.log(await this.page.locator('label').filter({hasText: pairKey1}).first().locator('..').locator('input').getAttribute('value'));
        // Assume 'page' is your Playwright Page object and 'textBoxSelector' is the selector for your textbox
      const textValue = await this.page.locator('label').filter({hasText: pairKey1}).first().locator('..').locator('input').inputValue();
      console.log("textValue:",textValue);
      await expect(textValue).toBe(String(pairValue1));

        /*await this.selectProductunit.click();
        await this.page.locator('span').filter({ hasText: pairKey1 }).first().click();
        await this.page.waitForTimeout(2000);
        await this.page.locator('label').filter({hasText: pairKey1}).first().locator('..').locator('input').fill(String(pairValue1));
        await this.page.locator('label').filter({hasText: String(pairValue2)}).first().locator('..').locator('select');*/
      }

    }
  }
    
async addInventory(openingInventory,inventoryType,inventoryLocation,
  addedBy,addedOn,showLiveInventory,greaterThanQty,customInventoryType) {
    
  await this.inventory.check();

  //if( inventory === 'true') {
    /*await this.inventory.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    await this.inventory.hover();
    await this.inventory.check();
    await this.page.waitForTimeout(2000);
    await this.openingInventory.waitFor({ state: 'visible', timeout: 20000 });*/
    await this.openingInventory.fill(openingInventory)    
    await this.inventorySelect.selectOption(inventoryType);
    await this.page.waitForTimeout(2000);
    await this.inventoryLocation.fill(inventoryLocation)
    await this.inventoryAddedBy.fill(addedBy)
    await this.inventoryAddedOn.fill(addedOn)
      if(showLiveInventory !== 'true') {
        await this.showGreaterThan.click();
        console.log("gresater",greaterThanQty)
        console.log("custom",customInventoryType)
        await this.greaterThanQty.fill(greaterThanQty)
        await this.customInventoryType.selectOption(customInventoryType);
      }
  //}
  
};

async verifyProductPricing(templateCost,templateDenisty) {
  // verification for density value and density cost
  await expect(this.templateDensityValue).toHaveText(templateDenisty);
  await expect(this.templateCostValue).toHaveText(templateCost);
}

// Method to fill package details
async packageDetailsInput(packageAttributes,mqo,mqs,stackable) {
   // if (packageAttributes === 'true') {
      await this.packageAttributes.check();
      await this.packageDetails.click();

      await this.page.waitForTimeout(2000);
      console.log("skuPackage",this.skuPackage)
     // await this.skuPackage.first().check();
      
     if (!(await this.skuPackage.isChecked()) && await this.skuPackage.isEnabled()) {
      await this.skuPackage.click(); }
     //await this.yesButton.click();

    //  console.log("mqocustom",this.mqoCustom)
    //  console.log("mqs",this.mqs)
      await this.mqoCustom.fill(mqo);
      await this.mqs.fill(mqs);
      if( stackable !== 'true') {
        await this.stackableNo.click();
      }
      await this.addNewPackage.click();
    //}
   // const valuePage2 = await this.productConsidered.textContent();
   // await expect(this.productConsidered).toHaveText('box');//toHaveText
    }

// Method to fill pricing details
async pricing(unitBuyerMargin,unitBuyerDecimal,skuBuyerMargin,skuBuyerDecimal,palletBuyerMargin,
  palletBuyerDecimal,containerBuyerMargin,containerBuyerDecimal){
    console.log("unitBuyerMargin",unitBuyerMargin)  
    await this.pricingDetails.click();
      console.log(this.unitBuyerMargin)
     // await this.unitBuyerMargin.fill(`${unitBuyerMargin}%`)
     await this.unitBuyerMargin.fill(unitBuyerMargin)
      await this.unitBuyerDecimal.fill(unitBuyerDecimal)
      await this.skuBuyerMargin.fill(skuBuyerMargin)
      await this.skuBuyerDecimal.fill(skuBuyerDecimal)
      await this.skuBuyerMargin.fill(palletBuyerMargin)
      await this.skuBuyerDecimal.fill(palletBuyerDecimal)
      await this.skuBuyerMargin.fill(containerBuyerMargin)
      await this.skuBuyerDecimal.fill(containerBuyerDecimal)
    }

// Method to add other details like keywords
async other(addKeywordInput){
    await this.otherDetails.click();
    await this.addKeywordInput.fill(addKeywordInput)
    await this.addKeyword.click()
    // await this.publish.click();
    }
}
