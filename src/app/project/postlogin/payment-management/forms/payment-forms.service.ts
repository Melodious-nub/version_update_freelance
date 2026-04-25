import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class PaymentFormsService {
  constructor(public _fb: FormBuilder) {}

  createInvoiceForm(): FormGroup {
    return this._fb.group({
      id: [null],
      audit: this._fb.group({
        createdDate: [null],
        createdById: [null],
        createdByName: [null],
        createdByUserName: [null],
        lastModifiedDate: [null],
        lastModifiedById: [null],
        lastModifiedByName: [null],
        lastModifiedByUserName: [null],
        businessAccountId: [null],
      }),
      transactionId: [null],
      isReceiving: [false],
      buyingType: [null],
      discountPercentage: [null],
      discountCost: this.createCostGroup(),
      salesTaxPercentage: [null],
      salesTaxCost: this.createCostGroup(),
      requestFrom: this.createAccountGroup(),
      requestTo: this.createAccountGroup(),
      deliveryAddress: [null],
      requiredByDate: [null],
      expectedByDate: [null],
      returnDate: [null],
      dadyInPoints: [null],
      importLocalType: ['LOCAL'],
      deliveryPickup: [null],
      reminderCount: [null],
      odometer: this._fb.group({
        value: [null],
        odometerType: [null],
      }),
      palletTypeInformation: [null],
      noteDescription: [null],
      isRead: [false],
      isVendorRead: [false],
      isCustomerRead: [false],
      isQuickCheckout: [null],
      cost: this.createCostGroup(),
      deliveryCost: this.createCostGroup(),
      deliveryCostInputByUser: [false],
      totalCost: this.createCostGroup(),
      weight: this.createCostGroup(),
      volume: this.createCostGroup(),
      referenceOrder: this._fb.group({
        rfQuotationId: [null],
        quotationId: [null],
        purchaseOrderId: [null],
        saleOrderId: [null],
      }),
      editTillDate: [null],
      date: [this.getTodayDate()],
      shipper: [null],
      quantity: [1],
      totalSku: [null],
      isCreatedFromPDF: [null],
      isFileSaved: [null],
      fileName: [null],
      status: ['DRAFT'],
      productPackages: this._fb.array([]),
      buddyAccounts: [null],
      messages: [null],
      paymentStatus: [null],
      requireNewInvoicePdf: [null],
      media_urls: [],
      invoicePayments: this._fb.array([]),
      isUpdated: [false],
      paymentTermId: [null],
    });
  }

  createCostGroup(): FormGroup {
    return this._fb.group({
      attributeValue: [null],
      userConversionUom: [null],
    });
  }

  createAccountGroup(): FormGroup {
    return this._fb.group({
      id: [null],
      name: [null],
      firstName: [null],
      lastName: [null],
    });
  }

  createMediaUrlGroup(): FormGroup {
    return this._fb.group({
      id: [null],
      fileType: [null],
      rfquotation: [null],
      media_url: [null],
    });
  }

  createInvoicePaymentGroup(): FormGroup {
    return this._fb.group({
      id: this._fb.group({
        invoiceId: [null],
        paymentId: [null],
      }),
      audit: this._fb.group({
        createdDate: [null],
        createdById: [null],
        createdByName: [null],
        createdByUserName: [null],
        lastModifiedDate: [null],
        lastModifiedById: [null],
        lastModifiedByName: [null],
        lastModifiedByUserName: [null],
        businessAccountId: [null],
      }),
      paidAmount: this.createCostGroup(),
      paymentDate: [null],
    });
  }

  createProductPackageGroup(): FormGroup {
    return this._fb.group({
      id: [null],
      quantity: [null],
      loadingType: [null],
      isCustomized: [null],
      cost: this.createCostGroup(),
      isCostInputByUser: [null],
      totalCost: this.createCostGroup(),
      weight: this.createCostGroup(),
      totalWeight: this.createCostGroup(),
      volume: this.createCostGroup(),
      totalVolume: this.createCostGroup(),
      metricCost: this.createCostGroup(),
      productDetails: this._fb.group({
        id: [null],
        considerCost: this.createCostGroup(),
        cost: this.createCostGroup(),
        weight: this.createCostGroup(),
        density: this.createCostGroup(),
        volume: this.createCostGroup(),
        surfaceArea: this.createCostGroup(),
        metricCost: this.createCostGroup(),
        isSelfProduct: [null],
        qoh: [null],
        skuCost: this.createCostGroup(),
        considerSkuCost: this.createCostGroup(),
        skuPrice: this.createCostGroup(),
        status: [null],
        skuWeight: this.createCostGroup(),
        skuVolume: this.createCostGroup(),
        skuMetricCost: this.createCostGroup(),
        productMetaId: [null],
        skuPackageId: [null],
        productCode: [null],
        description: [null],
        skuPackageContent: [null],
        productTypeDescription: [null],
        productSubTypeDescription: [null],
        productMetaBusinessAccountId: [null],
        productBusinessAccountId: [null],
        skuPackageType: [null],
        odometer: this._fb.group({
          value: [null],
          odometerType: [null],
        }),
      }),
      invoicePackageCustomAttributeValues: this._fb.array([]),
      skuCost: this.createCostGroup(),
      unitCost: this.createCostGroup(),
      unitQuantities: [null],
      skuQuantities: [null],
      unitWeight: this.createCostGroup(),
      skuWeight: this.createCostGroup(),
      unitVolume: this.createCostGroup(),
      skuVolume: this.createCostGroup(),
      productId: [null],
      packageId: [null],
    });
  }

  getTodayDate() {
    const prevseventhDate = new Date();
    const year = prevseventhDate.getFullYear();
    const month = ('0' + (prevseventhDate.getMonth() + 1)).slice(-2);
    const day = ('0' + prevseventhDate.getDate()).slice(-2);
    const dateString = `${year}-${month}-${day}`;
    return dateString;
  }

  get15DaysAfterTodayDate() {
    const current = new Date();
    const expiryDate = new Date(current.getTime() + 15 * 24 * 60 * 60 * 1000);
    const year = expiryDate.getFullYear();
    const month = ('0' + (expiryDate.getMonth() + 1)).slice(-2);
    const day = ('0' + expiryDate.getDate()).slice(-2);
    const dateString = `${year}-${month}-${day}`;
    return dateString;
  }
}
