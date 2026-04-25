import { Injectable } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ContainerFormsService {
  constructor(public _fb: UntypedFormBuilder) {}

  createContainerForm(): UntypedFormGroup {
    return this._fb.group({
      containerQuoteNumber: [],
      isExport: [],
      id: [null],
      requestFromId: [null],
      requestToId: [null],
      branchId: [null],
      audit: [null],
      containerTypeInformation: this._fb.group({
        id: [null],
        containerTypeId: [3],
        weight: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        volume: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
      }),
      incoTermId: [null],
      containerDate: [null],
      editTillDate: [null],
      date: [null],
      departureDate: [null],
      arrivalDate: [null],
      departurePortId: [null],
      arrivalPortId: [null],
      paymentTermId: [null],
      gateOpenDate: [null],
      gateCloseDate: [null],
      loadingDate: [null],
      loadingType: [null],
      containerExpense: this._fb.group({
        id: [null],
        cost: [null],
        expenseByWeight: [null],
        expenseByVolume: [null],
        miscellaneousCost: [null],
        labourCost: [null],
        unloadingMaterialCost: [null],
        expenseCalculatorType: ['MAXIMUM'],
        containerContacts: this._fb.array([]),
        unloadingMaterialExpenses: this._fb.array([]),
        labourExpenses: this._fb.array([]),
        miscellaneousExpenses: this._fb.array([]),
      }),
      documents: this._fb.array([]),
      vesselName: [null],
      vesselNumber: [null],
      containerOrders: this._fb.array([]),
      containerQuotations: this._fb.array([]),
      containerNumber: [null],
      localContainerNumber: [null],
      bolNumber: [null],
      mblNumber: [null],
      hblNumber: [null],
      totalOrders: [null],
      totalSKUs: [null],
      totalUnits: [null],
      importCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      exportCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      weight: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      volume: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      containerOdometer: this._fb.group({
        value: [null],
        odometerType: [null],
      }),
      filledOdometer: this._fb.group({
        value: [null],
        odometerType: [null],
      }),
      remainingOdometer: this._fb.group({
        value: [null],
        odometerType: [null],
      }),
      ssealNumber: [null],
      csealNumber: [null],
      handlingManagerId: [null],
    });
  }

  containerOrderForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      sortOrder: [null],
      purchaseOrderId: [null],
      purchaseOrderDetail: this._fb.group({
        id: [null],
        audit: [null],
        totalSku: [null],
        expanded: [false], // extra attribute
        odometer: this._fb.group({
          value: [null],
          odometerType: [null],
        }),
        transactionId: [null],
        requiredByDate: [null],
        importLocalType: ['LOCAL'],
        deliveryPickup: [null],
        reminderCount: [null],
        palletTypeInformation: [null],
        noteDescription: [null],
        noOfProductsInOrder: [],
        isRead: [null],
        cost: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        weight: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        volume: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        referenceOrder: this._fb.group({
          rfQuotationId: [null],
          quotationId: [null],
          purchaseOrderId: [null],
          saleOrderId: [null],
        }),
        status: [null],
        productPackages: this._fb.array([]),
        messages: [null],
        requestFromId: [null],
        requestToId: [null],
        requestFrom: [null],
        requestTo: [null],
        incoTermId: [null],
        requestFromName: [null],
        requestToName: [null],
        incoTermDescription: [null],
        portId: [null],
        containerTypeId: [null],
        noteId: [null],
      }),
      containerProducts: this._fb.array([]),
      cost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      weight: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      volume: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      totalSku: [null],
      totalOrders: [null],
      palletLocation: [null],
      loadingType: [null],
      quantityReceived: [null],
      quantityOrdered: [null],
      quantityLoaded: [null],
      note: [null],
      status: [null],
      expenseByPercent: [null],
      expenseByWeight: [null],
      expenseByVolume: [null],
      expenseBySKU: [null],
      noOfProductsInOrder: [null],
    });
  }

  productPackageForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      quantity: [null],
      cost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      totalCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      weight: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      totalWeight: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      volume: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      totalVolume: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      metricCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      productDetails: [null],
      containerInventory: this._fb.group({
        locationX: [null],
        locationY: [null],
        locationZ: [null],
        loadingType: [null],
        quantityLoaded: [null],
        quantityReceived: [null],
      }),
      packageCustomAttributeValues: [null],
      sortOrder: [null],
      skuCost: [null],
      productId: [null],
      packageId: [null],
      totalSku: [null],
      skuQuantities: [null],
    });
  }

  containerContactForm(): UntypedFormGroup {
    return this._fb.group({
      forImporter: [false],
      forExporter: [false],
      isShareable: [true],
      addedByBusinessAccountId: [],
      containerExpenseTypeId: [null],
      amountPayableTo: [null],
      phone: [null],
      emailId: [null],
      cost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      status: [null],
    });
  }

  unloadingMaterialExpenseForm(): UntypedFormGroup {
    return this._fb.group({
      addedByBusinessAccountId: [],
      productId: [null],
      quantity: [null],
      quantityUsed: [null],
      cost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      note: [null],
    });
  }

  labourExpenseForm(): UntypedFormGroup {
    return this._fb.group({
      addedByBusinessAccountId: [],
      containerExpenseTypeId: [null],
      amountPayableTo: [null],
      phone: [null],
      hourlyRate: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      cost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      status: [null],
      rating: [null],
    });
  }
  miscellaneousExpenseForm(): UntypedFormGroup {
    return this._fb.group({
      // srno:[],
      addedByBusinessAccountId: [],
      containerExpenseTypeId: [null],
      cost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      invoiceNumber: [null],
      checkNumber: [null],
      amountPayableTo: [null],
      status: [null],
      fromContacts: [null],
    });
  }

  documentForm(): UntypedFormGroup {
    return this._fb.group({
      addedByBusinessAccountId: [],
      number: [null],
      name: [null],
      providedBy: [null],
      date: [null],
      note: [null],
      fileName: [null],
      sortOrder: [null],
    });
  }

  containerProductForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      expanded: [false], // extra attribute
      locationX: [null],
      locationY: [null],
      locationZ: [null],
      loadingType: [null],
      quantityLoaded: [null],
      quantityReceived: [null],
      quantityOrdered: [null],
      note: [null],
      cost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      weight: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      volume: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      orderPalletLoadedInformations: this._fb.array([]),
      orderPalletReceivedInformations: this._fb.array([]),
      expenseByPercent: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      expenseByWeight: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      expenseByVolume: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      expenseBySKU: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      expenseByContainer: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      expenseForSingleProduct: [null],
      expense: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      productDetails: [],
      unitsPerContainer: [null],
      sortOrder: [null],
      quantity: [null],
      productId: [null],
      packageId: [null],
    });
  }

  orderPalletForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      palletNumber: [null],
      rowNumber: [null],
      columnNumber: [null],
      singleBoxNumber: [null],
      numberOfItems: [null],
      location: [null],
      note: [null],
      loadingType: [null],
    });
  }

  containerQuotationForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      sortOrder: [null],
      quotationId: [null],
      quotationListView: this._fb.group({
        id: [null],
        audit: [null],
        totalSku: [null],
        expanded: [false], // extra attribute
        odometer: this._fb.group({
          value: [null],
          odometerType: [null],
        }),
        transactionId: [null],
        requiredByDate: [null],
        importLocalType: ['LOCAL'],
        deliveryPickup: [null],
        reminderCount: [null],
        palletTypeInformation: [null],
        noteDescription: [null],
        noOfProductsInOrder: [],
        isRead: [null],
        cost: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        weight: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        volume: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        referenceOrder: this._fb.group({
          rfQuotationId: [null],
          quotationId: [null],
          purchaseOrderId: [null],
          saleOrderId: [null],
        }),
        status: [null],
        productPackages: this._fb.array([]),
        messages: [null],
        requestFromId: [null],
        requestToId: [null],
        requestFrom: [null],
        requestTo: [null],
        incoTermId: [null],
        requestFromName: [null],
        requestToName: [null],
        incoTermDescription: [null],
        portId: [null],
        containerTypeId: [null],
        noteId: [null],
      }),
      containerProducts: this._fb.array([]),
      cost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      weight: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      volume: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      totalSku: [null],
      totalOrders: [null],
      palletLocation: [null],
      loadingType: [null],
      quantityReceived: [null],
      quantityOrdered: [null],
      quantityLoaded: [null],
      note: [null],
      status: [null],
      expenseByPercent: [null],
      expenseByWeight: [null],
      expenseByVolume: [null],
      expenseBySKU: [null],
      noOfProductsInOrder: [null],
    });
  }
}
