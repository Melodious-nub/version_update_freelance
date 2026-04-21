import { PageObjectModel } from "./pageObjectModel";
import { Locator, Page, expect } from '@playwright/test';
import { generateUPC,generateEAN13 } from '../utils/helper';

export class Templates extends PageObjectModel {
    //Locators for templates
  addTemplate: Locator
  templateCode: Locator;
  templateName: Locator;
  selectIndustryType: Locator;
  selectIndustrySubtype: Locator;
  description: Locator;

  //matrixCostCalculatorpage
  matrixCostCalculator: Locator;

  //materialWise
  materialWise: Locator;
  rawMaterialWise: Locator;
  addOptions: Locator;
  productType: Locator;
  productSubType: Locator;

  //fixed
  fixed: Locator;
  enterMaterialCost: Locator;
  enterConversionCost: Locator;
  type: Locator;


  //none
  none: Locator;

  constructor(page: Page) {
    super(page);

    //Locators for template 
    this.addTemplate = this.page.getByRole('button', { name: 'Add Template' })
    this.templateCode = this.page.locator('input[ng-reflect-name="templateCode"]');
    this.templateName =this.page.locator('input[ng-reflect-name="templateName"]');
    this.selectIndustryType = this.page.locator('input#yesno').first();
    this.selectIndustrySubtype = this.page.locator('input#yesno').nth(1);
    this.description = this.page.locator('textarea[ng-reflect-name="description"]')

    //matrix cost calculator
    this.matrixCostCalculator = this.page.getByText('Matrix Cost Calculator');

    //process wise

    //material wise
    this.materialWise = this.page.getByRole('radio', { name: 'Material Wise' });
    this.rawMaterialWise = this.page.getByRole('textbox', { name: 'Enter Product of Process Name' });
    
    this.type = this.page.locator('#type');
   //await page1.getByLabel('Raw Material Details Select').getByRole('button').filter({ hasText: 'add_circle_outline' }).click(); this.addOptions = this.page.getByRole('region', { name: 'Raw Material Details kk' }).getByRole('button')
    this.addOptions = this.page.locator('dadyin-button[ng-reflect-type="icon"]')
    this.productType = this.page.locator('select[ng-reflect-name="productTypeId"]')
    this.productSubType = this.page.locator('select[ng-reflect-name="subProductId"]')


    //fixed
    this.fixed = this.page.getByRole('radio', { name: 'Fixed' });
    this.enterMaterialCost = this.page.getByRole('region', { name: 'Material Cost' }).getByPlaceholder('Enter your value');
    this.enterConversionCost = this.page.getByRole('region', { name: 'Conversion Cost' }).getByPlaceholder('Enter your value');

    //none
    this.none = this.page.getByRole('radio', { name: 'None' })
  }
    
    async templateInfo(){
    await this.addTemplate.click()
    await this.templateCode.fill('addKeywordInput');
    await this.templateName.fill('testing purpose');
    await this.selectIndustryType.click();
    await this.page.locator('span').filter({ hasText:'Plastic'  }).first().click();
    await this.selectIndustrySubtype.click();
    await this.page.locator('span').filter({ hasText: 'Garbage Bag' }).first().click();
    await this.description.click()
    await this.description.fill('testing template');

    }
  
  async matrixCalculator(){
    //materialWise
    

    //fixed
    await this.fixed.click();
    await this.enterMaterialCost.fill('500');
    await this.enterConversionCost.fill('300');

    //none
    //await page1.locator('div').filter({ hasText: /^Material Wise$/ }).click();
    await this.none.click();

  }
  //async productAttribute(){

  

}