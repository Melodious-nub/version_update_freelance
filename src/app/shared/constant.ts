export const apiModules = {
  attribute: 'attributes/',
  addAttribute: 'dadyin-api/meta/attributes/',
  attribute_groups: 'attribute_groups/',
  productList: 'products/',
  product_template: 'product_templates/',
  product_type: 'product_types/',
  processes: 'processes/',
  prod_calculation: 'product_calculation/',
  conversion_type: 'conversion_types/',
  calculator_meta: 'calculator_meta/',
  hsn_code: 'hsn_code/',
  logged_in_user: 'user_account/',
  role: 'roles/',
  loginUrlContext: '/accounts/',
  product_list: 'product_list/',
  volume_calculation: 'volume_calculation/',
  get_countries: 'dadyin-api/geo/countries',
  get_city: 'dadyin-api/geo/states',
  keywords: 'dadyin-api/relationaccounts/keywords',
  get_cityFrom_country: 'dadyin-api/geo/countries',
  get_business_account_from_invite: 'dadyin-api/businessaccounts/invite',
  get_business_type: 'dadyin-api/businessaccounts/businesstypes/all',
  get_business_categories: 'dadyin-api/businessaccounts/businesscategories/all',
  register_business_account: 'dadyin-api/businessaccounts/register',
  load_business_account: 'dadyin-api/businessaccounts/accounts/',
  select_business_account: 'dadyin-api/businessaccounts/select',
  save_business_account_regi: 'dadyin-api/businessaccounts/register',
  get_all_Branch: 'branch/getall',
  delete_branch: 'branch/delete',
  save_branch: 'branch/save',
  save_all_branch: 'branch/saveAll',
  get_business_account: 'dadyin-api/businessaccounts',
  update_business_account: 'dadyin-api/businessaccounts/',
  businessBulkUploadSample: 'dadyin-api/businessaccounts/bulk-upload/sample',
  businessBulkUpload: 'dadyin-api/businessaccounts/bulk-upload',
  businessBulkUploadExtract: 'dadyin-api/businessaccounts/bulk-upload/extract',
  shop_name_status: 'dadyin-api/businessaccounts/shop',
  send_invite: 'dadyin-api/invite/',
  get_user: 'dadyin-keycloak-api/users/getuser',
  get_preference: 'dadyin-api/meta/config/componentuomsettings/withDefault',
  set_preference: 'dadyin-api/config/componentuomsettings',
  get_businessaccounts_byterm: 'dadyin-api/businessaccounts/getmatchlist/',
  getAllUsers: 'dadyin-api/businessaccounts/users',
  updateRelationStatus: 'dadyin-api/relationaccounts/updateStatus',
  delete_relation: 'dadyin-api/relationaccounts/',
  aiGenerateSeo: 'dadyin-api/ai/openai/generate-seo',
  aiGenerateImage: 'dadyin-api/ai/gemini/generate-product-images',
  viewLedger: 'dadyin-api/products',
  initializeProductionLog: 'dadyin-api/productionlogs/initialize',
  productionLogsList: 'dadyin-api/productionlogs/list',
  productionLogs: 'dadyin-api/productionlogs',
  calculateProductionLogValues: 'dadyin-api/productionlogs/calculatevalues',
};

export const userApiModules = {
  registerAndGenerateBusinessAccount:
    'dadyin-api/useronboading/register/userwithbusinessaccount',
  signup: 'dadyin-api/useronboading/register',
  change_password: 'dadyin-api/useronboading/changepassword',
  save_employee: 'dadyin-api/employee/save',
  save_all_employee: 'dadyin-api/employee/saveAll',
  send_employee_invite: 'dadyin-api/invite/employee/send',
  send_invite: 'dadyin-api/invite/',
  getAllEmployee: 'dadyin-api/employee/getAllEmployee',
  employee: 'dadyin-api/employee',
  signup_otp: 'dadyin-api/useronboading/generateotp',
  signup_validate_otp: 'dadyin-api/useronboading/validateotp',
  signin: 'dadyin-api/useronboading/signin',
  forgot_password: 'dadyin-api/recovery/forgotpassword',
  reset_password: 'dadyin-api/recovery/resetpassword',
  validate_reset_password: 'dadyin-api/recovery/resetpassword/validatelink',
  get_user_for_invite: 'dadyin-api/invite',
  get_all_notifications: 'dadyin-api/notification/all',
  change_seen_status: 'dadyin-api/notification/change/seen',
  getVendorStats: 'dadyin-api/order/vendor/orderCounts',
  getCustomerStats: 'dadyin-api/order/customer/orderCounts',
  getHomePageStats: 'dadyin-api/order/counts/byType'
};

export const orderConfigModule = {
  saveproductAttributes: 'dadyin-api/config/order/productdisplaysettings/',
  getAllproductAttributeSets:
    'dadyin-api/config/order/productdisplaysettings/all',
  transactionCategories:
    'dadyin-api/config/order/productdisplaysettings/transactioncategories/all',
  getAllproductAttributeSetByCategory:
    'dadyin-api/config/order/productdisplaysettings/find/by?transactionCategory=',
  productAttributesMaster: 'dadyin-api/meta/attributes/productattributes/all',
  priceOptionsMaster:
    'dadyin-api/config/order/productdisplaysettings/priceoptions/all',
  infoOptionsMaster:
    'dadyin-api/config/order/productdisplaysettings/infooptions/all',
  saveNotes: 'dadyin-api/notes/',
  getAllNotes: 'dadyin-api/notes/all',
  getNoteType: 'dadyin-api/notes/',
  tierPricing: 'dadyin-api/products/get/productTierPricing',
  productDetail: 'dadyin-api/products/productDetail',
  productDetailIds: 'dadyin-api/products/productDetailByIds',
};

export const systemConfigModule = {
  saveBusinessEntityConfiguration: 'dadyin-api/business-entity-configurations/',
  getConfigurationTypes: 'dadyin-api/business-entity-configurations/types',
  getActiveConfiguration: 'dadyin-api/business-entity-configurations/active/',
};

export const LOCALSTORAGEKEYS = Object.freeze({
  PRODUCTATTRIBUTE: 'PRODUCTATTRIBUTE',
  PRODUCTTYPE: 'PRODUCTTYPE',
  PRODUCTSUBTYPE: 'PRODUCTSUBTYPE',
  INVITELINK: 'INVITELINK',
});

export const rfqAPIs = {
  port: 'ports/',
  incoterms: 'incoterms/',
  submit_rfq: 'rfqs/',
  product_purchase_history: 'product_purchase_history/',
  send_reminder: 'send_reminder/',
  list_rfq: 'rfqs/',
  rfq_calculations: 'rfq_calculations/',
  list_incoming_requests: 'incoming_requests/',
  type_of_notes: 'notes/',
  containertypes: 'containertypes/',
};

export const productTemplate = {
  getAllHsnIndia: 'dadyin-api/meta/hsns/ind/all',
  getAllHsnUsa: 'dadyin-api/meta/hsns/usa/all',
  getProductType: 'dadyin-api/producttypes/all',
  getPackageType: 'dadyin-api/producttemplates/packageTypes/',
  getIndustryType: 'dadyin-api/meta/industrytypes/all',
  getAllProductTemplate: 'dadyin-api/producttemplates/all',
  getPagedProductTemplate: 'dadyin-api/producttemplates/',
  getSingleProductTemplate: 'dadyin-api/producttemplates/',
  addProductTemplate: 'dadyin-api/producttemplates/',
  saveProductTemplate: 'dadyin-api/producttemplates/',
  getAllProcesses: 'dadyin-api/processes/all',
  getAllConversionTypes: 'dadyin-api/meta/conversiontypes/all',
  getAllAttributes: 'dadyin-api/meta/attributes/all',
  getAllAttributesTypes: 'dadyin-api/meta/attributes/attributetypes/all',
  matricCalculator: 'dadyin-api/metriccalculator/',
  getAllProductList: 'dadyin-api/products/search/forproduct',
  getAllProductAll: 'dadyin-api/products/all',
  getAllProductsForProcess: 'dadyin-api/products/search/forprocess',
  getSingleProduct: 'dadyin-api/products',
  copySingleProduct: 'dadyin-api/products/copy',
  copySingleProductForCustomer: 'dadyin-api/products/copy/forCustomer',
  calculator_meta: 'dadyin-api/meta/calculators/all/',
  add_calculator_meta: 'dadyin-api/meta/calculators/',
  calculate_values: 'dadyin-api/products/calculatevalues',
  addSingleProduct: 'dadyin-api/products/',
  getRelatedPoDetail: 'dadyin-api/products/',
  template_calculate_values: 'dadyin-api/producttemplates/calculatevalues',
  getProductTypeById: 'dadyin-api/producttypes/',
  getProductSubTypeById: 'dadyin-api/productsubtypes/',
  getProcessById: 'dadyin-api/processes/',
  wasteOption: 'dadyin-api/producttemplates/calculatevalues/options',
  rateProduct: 'dadyin-api/products/rating',
  rawMaterialPrice: 'dadyin-api/ai/rawMaterial/latest',
  bulkUploadSampleExcelTemplate: 'dadyin-api/products/bulk-upload/sample',
  bulkUploadProducts: 'dadyin-api/products/bulk-upload',
  getPurchaseHistory: 'dadyin-api/products/purchaseHistory',
  fetchCompetitorPrices: 'dadyin-api/products/',
};

export const productType = {
  getProductTypeList: 'dadyin-api/producttypes/',
  getAllProductType: 'dadyin-api/producttypes/all',
  saveProductType: 'dadyin-api/producttypes/',
  getProductSubTypeList: 'dadyin-api/productsubtypes/',
  getAllProductSubType: 'dadyin-api/productsubtypes/all',
  saveProductSubType: 'dadyin-api/productsubtypes/',
  getBindingData: 'dadyin-api/productsubtypes/',
  productCategory: 'dadyin-api/meta/productcategories/all',
  saveProductCategory: 'dadyin-api/meta/productcategories/',
  getProductCategories: 'dadyin-api/relationaccounts/get/category/assigned',
  getCategoryDetailByIds:'dadyin-api/meta/productcategories/byIds',
  customerCategory: 'dadyin-api/meta/productcategories/all',
  getAdditionalCost: '/dadyin-api/meta/additionalCosts/all',
};

export const order = {
  getSaleableProductList: 'dadyin-api/products/list/saleable/',
  getAllProduct: 'dadyin-api/products/search/fororder',
  getAllProductPurchaseOrder: 'dadyin-api/products/search/forpurchaseorder',
  getAllProductReceivedPurchaseOrder: 'dadyin-api/products/search/forReceivedPurchaseOrder',
  downloadProducts: 'dadyin-api/purchaseorders/generate/html',
  purchaseOrder: 'dadyin-api/purchaseorders/',
  paymentOverview: 'dadyin-api/payments/byOrder/',
  savepurchaseOrder: 'dadyin-api/purchaseorders/save',
  refreshpurchaseOrder: 'dadyin-api/purchaseorders/save/refresh',
  calculatepurchaseOrder: 'dadyin-api/purchaseorders/calculatevalues',
  getAllreceivedPurchaseOrders:
    'dadyin-api/purchaseorders/search/receivedorders/',
  deleteReceivedPurchaseOrder: 'dadyin-api/purchaseorders/',
  copyProductForAccount: 'dadyin-api/products/copyProductForAccount',
  copyProductForCustomization:
    'dadyin-api/purchaseorders/copyCustomizedProductForAccount',
  getreceivedPOById: 'dadyin-api/purchaseorders/receivedorders/',
  getAllrfQs: 'dadyin-api/rfqs/',
  getRfqById: 'dadyin-api/rfqs/',
  calculaterfq: 'dadyin-api/rfqs/calculatevalues',
  getAllQuotations: 'dadyin-api/quotations/',
  getAllReceivedQuotations: 'dadyin-api/quotations/search/receivedquotations',
  calculateQuotation: 'dadyin-api/quotations/calculatevalues',
  getAllRecEnquiries: 'dadyin-api/rfqs/search/receivedrfqs/',
  getAllQuotationsById: 'dadyin-api/quotations/',
  calculateReceivedPOValues:
    'dadyin-api/purchaseorders/receivedorders/calculatevalues',
  generatePdf: 'dadyin-api/pdf/po/generate/pdf',
  generateQuotationPdf: 'dadyin-api/quotations/generate/pdf',
  generateRFQPdf: 'dadyin-api/rfqs/generate/pdf',
  markAsRead: 'dadyin-api/purchaseorders/update/readstatus',
  getTierPricingList: 'dadyin-api/products/get/customTierPricing/byProductIds',
  getProductTypesForVendor: 'dadyin-api/producttypes/forVendor',
  generatePoFromPdf: 'dadyin-api/ai/read/pdf/forOrder',
  recordManualPayments: 'dadyin-api/payments/record/manual/entry',
};

export const paymentManagement = {
  pendingPaymentBills:'dadyin-api/invoices/search/forPendingPayment',
  initiateInvoicePayment:'dadyin-api/payments/initiate/invoicePayment',
  saveInvoicePaymentAfterStripe:'dadyin-api/payments/confirm/invoicePayments',
  historyOfPayments:'dadyin-api/payments/'
}

export const customer = {
  getAllCustomerListNew: 'dadyin-api/relationaccounts/list/',
  getAllCustomerList: 'dadyin-api/relationaccounts/',
  saveCustomerDetail: 'dadyin-api/relationaccounts/',
};

export const relationAccountApis = {
  getNotes: 'dadyin-api/relationaccounts/notes/',
  getReminders: 'dadyin-api/relationaccounts/reminders/',
  getRelationStatus: 'dadyin-api/meta/relationstatuses/all',
  addNotes: 'dadyin-api/relationaccounts/notes/add/',
  addReminder: 'dadyin-api/relationaccounts/reminder/add/',
  updateLeadRelationStatus: 'dadyin-api/relationaccounts/updateDetails/',
  bulkUpdateLeadRelationStatus: 'dadyin-api/relationaccounts/bulkUpdateDetails',
  generateEmail: 'dadyin-api/ai/suggest/email/',
  sendEmail: 'dadyin-api/ai/send/email/lead/',
  bulkUploadLeads: 'dadyin-api/relationaccounts/upload/leads',
  downloadSampleFile: 'dadyin-api/relationaccounts/upload/sample/file',
  saveNoteByImage: 'dadyin-api/relationaccounts/notes/add/fromimage/',
};

export const container = {
  getAllContainerTypes: 'dadyin-api/meta/containertypes/all',
  getAllIncoTerms: 'dadyin-api/meta/incoterms/all',
  getAllPorts: 'dadyin-api/meta/ports/all',
  getAllPaymentTerms: 'dadyin-api/meta/paymentterms/all',
  getAllEmployee: 'dadyin-api/employee/getAllEmployee',
  getAllBranches: 'branch/getall',
  getAllPurchaseOrders: 'dadyin-api/purchaseorders/search/forcontainer',
  getAllQuotations: 'dadyin-api/quotations/',
  getAllPurchaseOrderPackages:
    'dadyin-api/purchaseorders/search/forContainer/productList',
  getAllQuotationPackages:
    'dadyin-api/quotations/search/forContainer/productList',
  getAllPurchaseOrdersExport:
    'dadyin-api/purchaseorders/search/forcontainer/export',
  getAllContainers: 'dadyin-api/containers/',
  calculateContainer: 'dadyin-api/containers/calculatevalues',
  createContainer: 'dadyin-api/containers',
  updateContainer: 'dadyin-api/containers',
  deleteContainer: 'dadyin-api/containers',
  labourDetails: 'dadyin-api/containers/laborDetails',
  getAllExpenseTypes: 'dadyin-api/containers/expenseTypes/',
  getAllMaterials:
    'dadyin-api/products/all?page=0&size=200&sort=description&filter=isSupplies:true',
};

export const inventoryin = {
  getPurchaseOrderForInventory: 'dadyin-api/inventories/',
  getPurchaseOrderForInventoryProductWise: 'dadyin-api/inventories/byproduct/',
  getPurchaseOrderById: 'dadyin-api/purchaseorders/',
  getInventoryById: 'dadyin-api/inventories/',
  getPalletDetail: 'dadyin-api/inventories/byproduct/palletdetail/',
  getPalletDetailOrderWise: '/dadyin-api/inventories/byproduct/palletdetail',
  getAllEmployee: 'dadyin-api/employee/getAllEmployee',
  getContainerTypes: 'dadyin-api/containertypes/all',
  calculate: 'dadyin-api/inventories/calculatevalues',
  createInventory: 'dadyin-api/inventories/',
  productWiseGetInventoryDetails:
    'dadyin-api/inventories/byproduct/productdetails',
  productWisecalculate: 'dadyin-api/inventories/byproduct/calculatevalues',
  productWiseSave: '/dadyin-api/inventories/byproduct/saveAll',
};

export const inventoryout = {
  getPurchaseOrderForInventory: 'dadyin-api/inventories/out/',
  getPurchaseOrderForInventoryProductWise:
    'dadyin-api/inventories/out/byproduct/',
  getSalesOrderById: 'dadyin-api/saleorders/',
  getInventoryById: 'dadyin-api/inventories/out/',
  getPalletDetail: 'dadyin-api/inventories/byproduct/palletdetail/',
  getPalletDetailOrderWise: 'dadyin-api/inventories/out/byproduct/palletdetail',
  getAllEmployee: 'dadyin-api/employee/getAllEmployee',
  getContainerTypes: 'dadyin-api/containertypes/all',
  calculate: 'dadyin-api/inventories/out/calculatevalues',
  createInventory: 'dadyin-api/inventories/out/',
  productWiseGetInventoryDetails:
    '/dadyin-api/inventories/out/byproduct/productdetails',
  productWisecalculate: 'dadyin-api/inventories/out/calculatevalues',
  productWiseSave: 'dadyin-api/inventories/out/saveall',
};

export const payment = {
  payment: 'dadyin-api/payments/',
  paymentOrderConfirm: 'dadyin-api/payments/confirm',
  paymentInitiate: 'dadyin-api/payments/initiate',
  getPaymentsByOrder: 'dadyin-api/payments/byOrder/',
  paymentAuditSave: 'dadyin-api/paymentAudit/save',
};

export const invoiceConfigModule = {
  getAllPaypal: 'dadyin-api/paypal/info/all',
  savePayPal: 'dadyin-api/paypal/info/',
  getAllVenmo: 'dadyin-api/venmo/info/all',
  saveVenmo: 'dadyin-api/venmo/info/',
  getAllBank: 'dadyin-api/bankaccount/info/all',
  saveBank: 'dadyin-api/bankaccount/info/',
  getPayPalById: 'dadyin-api/paypal/info/',
  getVenmoById: 'dadyin-api/venmo/info/',
  getBankById: 'dadyin-api/bankaccount/info/',
  getAllCategory: '/dadyin-api/invoice/category/all',
  getAllsubCategory: '/dadyin-api/invoice/subcategory/all',
  saveSubCategory: '/dadyin-api/invoice/subcategory/',
  saveCategory: '/dadyin-api/invoice/category/',
  getLastInvoice: 'dadyin-api/products',
  getInventoryLedger: 'dadyin-api/products',
  getInvoiceById: 'dadyin-api/invoice/',
  calculateInvoice:'dadyin-api/invoices/calculatevalues',
  saveInvoice:'dadyin-api/invoices/save',
  getInvoice:'dadyin-api/invoices',
  convertPoToInvoice:'dadyin-api/purchaseorders/converted/invoice',
  getBillsList: 'dadyin-api/invoices/search/bills',
  getInvoicesListCustomer: 'dadyin-api/invoices/search/invoices',
  getBillsListVendor: 'dadyin-api/invoices/search/bills',
};

export const SubscriptionModule = {
  initiateSubscriptionPayment: 'dadyin-api/payments/initiate/invoicePayment?amount=',
  confirmSubscriptionPayment: 'dadyin-api/payments/confirm/subscriptionPayment',
  updateBusiness: 'dadyin-api/useronboading/updateBusiness',
  applyPromoCode: 'dadyin-api/payments/apply/promo',
  removePromoCode: 'dadyin-api/payments/remove/promo?promoCode='
}

export const DadyInUsersModule = {
  getAllbusinessAccount: 'dadyin-api/businessaccounts/get/all',
  getInvitesList: 'dadyin-api/invite/list',
  updateBusinessLead: 'dadyin-api/businessaccounts/'
}