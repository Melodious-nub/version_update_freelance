import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class InventoryoutFormsService {
  constructor(public _fb: FormBuilder) {}

  createContainerForm(): FormGroup {
    return this._fb.group({
      id: [null],
      requestFromId: [null],
      requestToId: [null],
      branchId: [null],
      audit: [null],
      containerTypeInformation: this._fb.group({
        id: [null],
        containerTypeId: [null],
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
      containerNumber: [null],
      localContainerNumber: [null],
      bolNumber: [null],
      mblNumber: [null],
      hblNumber: [null],
      totalOrders: [null],
      totalSKUs: [null],
      totalUnits: [null],
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

  containerOrderForm(): FormGroup {
    return this._fb.group({
      id: [null],
      sortOrder: [null],
      purchaseOrderId: [null],
      purchaseOrderDetail: this._fb.group({
        id: [null],
        audit: [null],
        totalSKUs: [null],
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
      totalSKUs: [null],
      totalOrders: [null],
      palletLocation: [null],
      loadingType: [null],
      quantityReceived: [null],
      quantityLoaded: [null],
      note: [null],
      status: [null],
      expenseByPercent: [null],
      expenseByWeight: [null],
      expenseByVolume: [null],
      expenseBySKU: [null]
    });
  }

  productPackageForm(): FormGroup {
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
      totalSKUs: [null],
    });
  }

  containerContactForm(): FormGroup {
    return this._fb.group({
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

  unloadingMaterialExpenseForm(): FormGroup {
    return this._fb.group({
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

  labourExpenseForm(): FormGroup {
    return this._fb.group({
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
  miscellaneousExpenseForm(): FormGroup {
    return this._fb.group({
      containerExpenseTypeId: [null],
      cost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      invoiceNumber: [null],
      checkNumber: [null],
      amountPayableTo: [null],
      status: [null],
    });
  }

  documentForm(): FormGroup {
    return this._fb.group({
      number: [null],
      name: [null],
      providedBy: [null],
      date: [null],
      note: [null],
      fileName: [null],
      sortOrder: [null],
    });
  }

  containerProductForm(): FormGroup {
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
      weight:this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      volume: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      orderPalletInformations: this._fb.array([]),
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
        userConversionUom:[null],
      }),
      expenseBySKU: this._fb.group({
        attributeValue: [null],
        userConversionUom:[null],
      }),
      expenseByContainer: this._fb.group({
        attributeValue: [null],
        userConversionUom:[null],
      }),
      expenseForSingleProduct: [null],
      expense: this._fb.group({
        attributeValue:[null],
        userConversionUom: [null],
      }),
      unitsPerContainer: [null],
      sortOrder: [null],
      quantity:[null],
      productId:[null],
      packageId: [null],
    });
  }

  orderPalletForm(): FormGroup {
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

}
