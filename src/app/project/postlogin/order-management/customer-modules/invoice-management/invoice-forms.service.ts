import { Injectable, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class InvoiceFormsService {
  _fb = inject(UntypedFormBuilder);


  createInvoiceForm(): UntypedFormGroup {
    return this._fb.group({
      totalSku: [null],
      isUpdated: [false],
      isReceiving: [false],
      customNote: [],
      transactionReferenceNumber: [null],
      discountType: ['PERCENTAGE'],
      salesTaxType: ['PERCENTAGE'],
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
      paymentEnabled: [false],
      id: [null],
      buyingType: ['SKU'],
      qoh: [null],
      contactId: [null],
      debugInformation: [null],
      status: ['DRAFT'],
      purchaseOrderId: [null],
      saleOrderStatus: [null],
      saleOrderFromId: [null],
      saleOrderToId: [null],
      saleOrderTransactionId: [null],
      transactionId: [null],
      isQuickCheckout: [null],
      media_urls:[],
      media_url_ids: [],
      requestFrom: this.createExtendedAccountGroup(),
      requestTo: this.createExtendedAccountGroup(),
      requiredByDate: [null],
      returnDate: [null],
      importLocalType: ['LOCAL'],
      referenceContainerId: [null],
      isCreateNewContainer: [false],
      exporterBusinessId: [null],
      deliveryPickup: [null],
      reminderCount: [null],
      odometer: this._fb.group({
        value: [null],
        odometerType: [null],
      }),
      incoTermId: [null],
      arrivalPortId: [null],
      departurePortId: [null],
      containerTypeId: [null],
      dadyInPoints: [null],
      containerTypeDescription: [null],
      noteId: [null],
      noteTemplate: this._fb.group({
        id: [null],
      }),
      noteDescription: [null],
      isRead: [false],
      fulfilmentType: [],
      cost: this.createCostGroup(),
      totalCost: this.createCostGroup(),
      metricCost: this.createCostGroup(),
      weight: this.createCostGroup(),
      volume: this.createCostGroup(),
      buddyAccounts: [null],
      productPackages: this._fb.array([]),
      editTillDate: [null],
      expectedByDate: [null],
      date: [this.getTodayDate()],
      shipper: [null],
      quantity: [1],
      discountCost: this.createCostGroup(),
      discountPercentage: [],
      salesTaxPercentage: [null],
      salesTaxCost: this.createCostGroup(),
      deliveryCostInputByUser: [false],
      deliveryCost: this.createCostGroup(),
      rfQuotationId: [null],
      contactName: [null],
      contactPhone: [null],
      palletTypeInformation: [null],
      paymentStatus: [null],
      paymentTermId: [null],
      referenceOrder: this._fb.group({
        rfQuotationId: [null],
        quotationId: [null],
        purchaseOrderId: [null],
        saleOrderId: [null],
      }),
      loadingTypeId: [null],
      invoicePayments: this._fb.array([]),
    });
  }

  createCostGroup(): UntypedFormGroup {
    return this._fb.group({
      attributeValue: [null],
      userConversionUom: [null],
    });
  }

  createAccountGroup(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      name: [null],
      firstName: [null],
      lastName: [null],
    });
  }

  createMediaUrlGroup(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      fileType: [null],
      rfquotation: [null],
      media_url: [null],
    });
  }
  createExtendedAccountGroup(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      debugInformation: [null],
      businessLines: [null],
      relationAccounts: [null],
      branchDetails: [null],
      code: [null],
      externalId: [null],
      businessLogo: [null],
      companyStamp: [null],
      digitalStamp: [null],
      isSystemAccount: [null],
      type: [null],
      roleName: [null],
      fromInvite: [false],
      inviteId: [null],
      name: [null],
      firstName: [null],
      lastName: [null],
      language: [null],
      currency: [null],
      currency2nd: [null],
      gst: [null],
      primaryContact: [null],
      hibernateLazyInitializer: [null],
    });
  }
  createInvoicePaymentGroup(): UntypedFormGroup {
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

  createProductPackageGroup(): UntypedFormGroup {
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
        audit: [null],
        considerCost: this.createCostGroup(),
        cost: this.createCostGroup(),
        weight: this.createCostGroup(),
        density: this.createCostGroup(),
        volume: this.createCostGroup(),
        surfaceArea: this.createCostGroup(),
        metricCost: this.createCostGroup(),
        isSelfProduct: [null],
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
        qoh: [null],
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
      productId: [null, Validators.required],
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
