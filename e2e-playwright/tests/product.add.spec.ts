import { test, expect } from '@playwright/test';
import { Product } from '../models/productManagement';
import { HomePage } from '../models/homePage';
import { LoginPage } from '../models/login';
import { getTestData, setTestData } from '../utils/helper';
import { CommonPage } from '../models/common';
import { extractExcelDataToJson } from '../utils/excel';
import { Templates } from '../models/productTemplate';
import { EnvironmentManager } from '../utils/environmentManager';


test.describe('Tests', () => {
  let commonPage: CommonPage;
  let productPage: Product;
  let loginPage: LoginPage;
  let homePage: HomePage;
  let data: any;
  let templatePage: Templates;
  let loginCreds: any;
  let envManager: EnvironmentManager;

  test.beforeAll(async () => {
    envManager = EnvironmentManager.getInstance();
    loginCreds = envManager.getLoginCredentials();
    setTestData();
  });

  test.beforeEach(async ({ page }) => {
    commonPage = new CommonPage(page);
    productPage = new Product(page); 
    loginPage = new LoginPage(page);
    homePage = new HomePage(page);   
    templatePage = new Templates(page);
  });

   //test.describe.parallel('Product Tests', () => {
      // Method 1: Run test for each product in the data array
    data = getTestData();
    data.productDetails.forEach((productData: any, index: number) => {
        test(`To add a product details successfully - Dataset ${index + 1} (${productData.ProductCode})`, async () => {
        //test(`To add a product details successfully - Dataset`, async () => {
  
      await loginPage.login(loginCreds.username, loginCreds.password, loginCreds.businessAccount);
    
      await commonPage.navigateToProductManagement();

      /*await productPage.productDetails('1234','test','12346789789','12346789789',
      'UNIT','Corrugated Box','unit','','','12346789789');*/
      await productPage.productDetails(productData.ProductCode,productData.ProductDescription,
        productData.UPCCode,productData.EANCode,productData.SKUType,productData.UnitCountSKU,
        productData.UnitName,productData.ProductType,productData.ProductSubtype,
        productData.ProductDescription); 

      await productPage.otherInfo(productData.choosepreferedvendor,productData.customProductFor,
        productData.saleable,productData.markasFavorite,productData.isaRawMaterial,
        productData.isaSupplies,productData.isaPackaging,productData.isCustomizable,
        productData.displayInQuickCheckout)
      
      await productPage.productAttribute(productData.productAttributes)

      //await productPage.addInventory('123','UNIT','chennai','surchay','2023-12-01','','2','UNIT')
      await productPage.addInventory(productData.openingInventory, productData.inventoryType, 
        productData.inventoryLocation,productData.addedBy,
        productData.addedOn,productData.showLiveInventory,productData.greaterThanQty,
        productData.customInventoryType)

     /*await productPage.packageDetailsInput(data.productDetails.packageAttributes,data.productDetails.mqo,
          data.productDetails.mqs,data.productDetails.stackable);   */ 

     //  await productPage.pricing('11','13','12','10','10','12','08','09')
       //await productPage.other('mfr')
      await productPage.pricing(productData.unitBuyerMargin,productData.unitBuyerDecimal,
        productData.skuBuyerMargin,productData.skuBuyerDecimal,productData.palletBuyerMargin,
        productData.palletBuyerDecimal,productData.containerBuyerMargin,productData.containerBuyerDecimal)

       await productPage.other(productData.addKeywordInput)
      await productPage.verifyProductPricing(productData.templateCost,productData.templateDenisty);

  });
  });
//});
   /*test('To add a product template successfully', async () =>{
    await loginPage.login(data.login.username, data.login.password);
    
    //await commonPage.navigateToProductManagement();
    await commonPage.navigateToTemplate();

    await templatePage.templateInfo()

   })*/
});