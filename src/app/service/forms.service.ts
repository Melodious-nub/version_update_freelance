import { Injectable } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormsService {


  constructor(private _fb: UntypedFormBuilder) { }

  createTemplateForm(): UntypedFormGroup {
    return this._fb.group({
      templateProcessMaterialType: ['FIXED_MATERIAL'],
      audit: [],
      status: ['DRAFT'],
      id: [null],
      templateCode: [null, [Validators.required]],
      templateName: [null, [Validators.required]],
      description: [null, [Validators.required]],
      industryTypeId: [null, [Validators.required]],
      industrySubTypeId: [null, [Validators.required]],
      templateCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      templateDensity: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      templateProcessType: ['PROCESS'],
      templateProcesses: this._fb.array([]),
      rawMaterialProcess: this.createRawMaterialProcess(),
      fixedProcess: this._fb.group({
        audit: [],
        id: [null],
        description: [null],
        processCalculator: [null],
        processCalculatorOptions: [[]],
        processConversionTypes: [[]],
        processNumber: [0],
        processProducts: [[]],
        processWastePercent: [null],
        productOfProcess: [null],
        materialMetricCost: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        conversionMetricCost: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        totalNetWeight: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        totalWaste: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        totalWeight: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        materialMetricCostSecondary: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        conversionMetricCostSecondary: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        isTotalWasteAddedByUser: [false]

      }),
      businessAccountId: [null],
      productTemplateCalculator: this._fb.group({
        description: [null],
        id: [null],
        metaCalculatorId: [null],
        packageCalculatorTemplates: this._fb.array([]),
        productCalculatorTemplateAttributeValues: this._fb.array([]),
      }),
      isSystem: [false],
      isPackageEntity: [false],
      attributeGroup: [null],
      isReadOnly: [false],
      inDraftMode: [true],
      productTypeIds: [],
      productSubTypeIds: [],
    });
  }

  // template calculator related

  createProductCalculatorTemplateAttributeForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      attributeValue: [null],
      userConversionUom: [null],
      attributeValueExpression: [null],
      sortOrder: [1],
      calculationOrder: [1],
      isReadOnly: [false],
      isHidden: [false],
      isUserInput: [false],
      colSpace: [100],
      attributeId: [null],
    });
  }

  createPackageCalculatorTemplateAttributeValues(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      attributeValue: [null],
      userConversionUom: [null],
      attributeValueExpression: [null],
      sortOrder: [1],
      calculationOrder: [1],
      isReadOnly: [false],
      isHidden: [false],
      isUserInput: [false],
      colSpace: [100],
      attributeId: [null],
    });
  }

  /// template process related

  createProcessForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      process: this._fb.group({
        totalUnits: [0],
        totalNetWeight: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        totalWeight: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        isTotalWasteAddedByUser: [false],
        totalWaste: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        audit: [],
        id: [null],
        description: [null],
        processNumber: [null],
        materialMetricCost: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        materialMetricCostSecondary: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        conversionMetricCost: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        conversionMetricCostSecondary: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        productOfProcess: this._fb.group({
          id: [null],
          audit: [],
          cost: this._fb.group({
            attributeValue: [0],
            userConversionUom: [],
          }),
          weight: this._fb.group({
            attributeValue: [0],
            userConversionUom: [],
          }),
          metricCost: this._fb.group({
            attributeValue: [0],
            userConversionUom: [],
          }),
          metricCostSecondary: this._fb.group({
            attributeValue: [0],
            userConversionUom: [],
          }),
          density: this._fb.group({
            attributeValue: [0],
            userConversionUom: [],
          }),
          densitySecondary: this._fb.group({
            attributeValue: [0],
            userConversionUom: [],
          }),
          hsnCode: null,
          productCalculator: null,
          exportDescription: null,
          isSku: false,
          isSystem: false,
          isRawMaterial: true,
          isPackagingMaterial: false,
          isSupplies: false,
          isSaleable: false,
          isFavourite: false,
          additionalCosts: [null],
          packages: [null],
          productMeta: this._fb.group({
            id: [],
            audit: [],
            hibernateLazyInitializer: [],
            description: ['', Validators.required],
            images: this._fb.array([]),
            isProductOfProcess: [false],
            productCode: [null],
            parentProductMetaId: [],
            metaTitle: [],
            metaDescription: [],
            metaKeyword: [],
            ogTitle: [],
            ogDescription: [],
            twitterTitle: [],
            twitterDescription: [],
          }),
          additionalExpense: [null],
          productCalculatorAttributeValues: [null],
          packageCalculatorTemplates: [null],
          productAttributeValues: [null],
          process: [null],
          businessAccountId: [null],
          productTypeId: [null, Validators.required],
          productSubTypeId: [null],
          productTemplateId: [null],
          productMetaId: [null],
          status: ['PUBLISHED']
        }),
        processProducts: this._fb.array([]),
        processConversionTypes: this._fb.array([]),
        isSystem: [false],
        isPackageEntity: [false],
        calculatorMeta: [null],
        processCalculator: [null],
        businessAccountId: [null],
        isLayerPercentageCalculated: [true],
        processWastePercent: [0],
        processCalculatorOptions: this._fb.array([]),

      }),
      existingProcessId: [0],
      isExistingProcess: [true],
      sortOrder: [1],
    });
  }

  private createAttributeValueGroup(attr?: any): UntypedFormGroup {
    return this._fb.group({
      attributeValue: [attr?.attributeValue ?? null],
      userConversionUom: [attr?.userConversionUom ?? null],
    });
  }





  createBatchForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      status: [null],
      audit: [null],
      logNumber: [null],
      grade: [null],
      color: [null],
      billetPcs: [null],
      billetSize: [null],
      billetLength: [null],
      billetWidth: [null],
      billetWeight: [null],
      endCutWeight: [null],
      section: [null],
      logDate: [null],
      supervisor: [null],
      shift: [null],
      templateProcessType: [null],
      logProcesses: this._fb.array([]),
      rawMaterialProcess: [null],
      fixedProcess: this._fb.group({
        audit: [],
        id: [null],
        description: [null],
        processCalculator: [null],
        processCalculatorOptions: [[]],
        processConversionTypes: [[]],
        processNumber: [0],
        processProducts: [[]],
        processWastePercent: [null],
        productOfProcess: [null],
        materialMetricCost: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        conversionMetricCost: this._fb.group({
          attributeValue: [null],
          userConversionUom: [null],
        }),
        totalNetWeight: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        totalWaste: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        totalWeight: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        materialMetricCostSecondary: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        conversionMetricCostSecondary: this._fb.group({
          attributeValue: [0],
          userConversionUom: [],
        }),
        isTotalWasteAddedByUser: [false]
      }),
      productId: [null],
      productTemplateId: [null],
      templateProcessMaterialType: ['FIXED_MATERIAL']
    });
  }

  createRawMaterialProcess(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      description: [null],
      processNumber: [null],
      materialMetricCost: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      materialMetricCostSecondary: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      conversionMetricCost: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      conversionMetricCostSecondary: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      totalNetWeight: this._fb.group({
        attributeValue: [0],
        userConversionUom: [],
      }),
      totalWaste: this._fb.group({
        attributeValue: [0],
        userConversionUom: [],
      }),
      totalWeight: this._fb.group({
        attributeValue: [0],
        userConversionUom: [],
      }),
      isTotalWasteAddedByUser: [false],
      productOfProcess: this._fb.group({
        id: [null],
        metricCost: this._fb.group({
          attributeValue: [0],
          userConversionUom: [null],
        }),
        density: this._fb.group({
          attributeValue: [0],
          userConversionUom: [null],
        }),
        metricCostSecondary: this._fb.group({
          attributeValue: [0],
          userConversionUom: [null],
        }),
        densitySecondary: this._fb.group({
          attributeValue: [0],
          userConversionUom: [null],
        }),
        productMeta: this._fb.group({
          id: [],
          audit: [],
          hibernateLazyInitializer: [],
          description: [],
          images: this._fb.array([]),
          isProductOfProcess: [false],
          productCode: [null],
          parentProductMetaId: [],
          metaTitle: [],
          metaDescription: [],
          metaKeyword: [],
          ogTitle: [],
          ogDescription: [],
          twitterTitle: [],
          twitterDescription: [],
        }),
        hsnCode: null,
        productCalculator: null,
        exportDescription: null,
        isSku: false,
        isSystem: false,
        isRawMaterial: true,
        isPackagingMaterial: false,
        isSupplies: false,
        isSaleable: false,
        isFavourite: false,
        inDraftMode: [true],
        additionalCosts: [[]],
        packages: [[]],
        additionalExpense: [],
        productCalculatorAttributeValues: [[]],
        packageCalculatorTemplates: [[]],
        productAttributeValues: [[]],
        process: [null],
        businessAccountId: [null],
        productTypeId: [null],
        productSubTypeId: [null],
        productTemplateId: [null],
        productMetaId: [null],
        status: ['PUBLISHED']
      }),
      processProducts: this._fb.array([]),
      processConversionTypes: this._fb.array([]),
      isSystem: [false],
      isPackageEntity: [false],
      calculatorMeta: [null],
      processCalculator: [null],
      businessAccountId: [null],
      processCalculatorOptions: this._fb.array([]),
      processWastePercent: [0],
    });
  }

  createProcessProductForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      productTypeId: [null, Validators.required],
      density: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      metricCost: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      subProductMetricCost: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      subProductDensity: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      processProductAttributeValues: this._fb.array([]),
      sortOrder: [0],
      usedPercent: [0],
      usedWeight: this._fb.group({
        attributeValue: [0],
        userConversionUom: ['kg'],
      }),
      wastePercent: [0],
      wasteWeight: this._fb.group({
        attributeValue: [0],
        userConversionUom: ['kg'],
      }),
      subProductId: [null, Validators.required],
    });
  }


  createProcessConversionTypeForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],

      considerCost: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),

      conversionTypeId: [null, Validators.required],
      cost: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      density: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      metricCost: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      surfaceArea: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      volume: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      weight: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      sortOrder: [1]
    });
  }


  createBatchProcessProductForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      subProductTypeName: [null],
      subProductName: [null],
      subProductId: [null, Validators.required],
      subProductMetricCost: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      subProductDensity: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      processProductAttributeValues: this._fb.array([]),
      sortOrder: [0],
      wastePercent: [0],
      usedPercent: [0],
      wasteWeight: this._fb.group({
        attributeValue: [0],
        userConversionUom: ['kg'],
      }),
      usedWeight: this._fb.group({
        attributeValue: [0],
        userConversionUom: ['kg'],
      }),
      volume: [0],
      density: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      metricCost: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),
      surfaceArea: [0],
    });

  }

  createConversionTypeForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      metricCost: this._fb.group({
        attributeValue: [0],
        userConversionUom: [null],
      }),

      processConversionAttributeValues: [null],
      sortOrder: [1],
      conversionTypeId: [null, Validators.required],
    });
  }

  createWasteOptionForm(): UntypedFormGroup {
    return this._fb.group({
      id: [],
      sortOrder: [],
      name: [],
      costFormula: [],
      densityFormula: [],
      cost: [],
      density: [],
      isSelected: [false],
    });
  }


  calculateOptionsForm(): UntypedFormGroup {
    return this._fb.group({
      wastePercent: [],
      cost: [],
      density: [],
      processCost: [],
      processDensity: [],
      processProductCalculators: this._fb.array([
        this._fb.group({
          usedPercent: [50],
          wastePercent: [],
          cost: [],
          density: [],
          productCalculatorOptions: [],
        }),
        this._fb.group({
          usedPercent: [50],
          wastePercent: [],
          cost: [],
          density: [],
          productCalculatorOptions: [],
        })
      ])
    });
  }

  // Related to Product

  createProductForm() {
    return this._fb.group({
      isLogsheetEnabled: [false],
      qoh: [null],
      adjustInventory: [null],
      patentNumber: [null],
      isPatentedProduct: [false],
      id: [null],
      hasExpiry: [false],
      minimumExpiry: [null],
      maximumExpiry: [null],
      productBuyingCapacities: this._fb.array([]),
      status: ['DRAFT'],
      templateCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      templateDensity: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      isDadyInQuickCheckoutEligible: [false],
      isNoGenericPurchase: [null],
      debugInformation: [null],
      isCustomizable: [false],
      isInventoryListed: [false],
      isImportExportable: [false],
      isAdvanceProduct: [false],
      isProductAttributes: [false],
      isPackageAttributes: [false],
      isSelfProduct: [null],
      audit: [null],
      cost: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      weight: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      density: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      volume: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      surfaceArea: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      metricCost: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      odometer: this._fb.group({
        odometerType: [null],
        value: [null],
      }),
      exportDetail: this._fb.group({
        exportDescription: [null],
        isExportDetailHidden: [false],
        hsnUsaCode: [null],
        hsnIndiaCode: [null]
      }),
      inventoryDetail: this._fb.group({
        showInventory: [true],
        showInventoryLocation: [false],
        showLiveInventory: [true],
        showCustomLiveInventoryValue: [false],
        openingInventory: [null],
        inventoryType: [],
        inventoryAddedOn: [],
        inventoryAddedBy: [],
        inventoryLocation: [],
        liveInventoryValue: [],
        customInventoryValue: [],
        customInventoryType: []
      }),
      tierPricingDetail: this._fb.group({
        tierPricingCustomization: this._fb.array([]),
        tierPricingQuickCheckout: this._fb.array([]),
        quickPricing: this._fb.group({
          quantityReceived: [],
          receivedPriceOption: [],
          estimatedCost: this._fb.group({
            attributeValue: [],
            userConversionUom: [],
          }),
          estimatedWeight: this._fb.group({
            attributeValue: [],
            userConversionUom: [],
          }),
          estimatedVolume: this._fb.group({
            attributeValue: [],
            userConversionUom: [],
          }),
          quantityOnHand: [],
          onHandPriceOption: [],
        }),
      }),
      skuName: [null],
      unitName: [null, Validators.required],
      unitCount: [],
      purchaseDescription: [],
      shapeForm: [null],
      upcCode: [null],
      eanCode: [null],
      skuCost: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      buyingCapacityCost: [null],
      productCalculator: [null],

      isSku: [false],
      isSystem: [null],
      isRawMaterial: [null],
      isPackagingMaterial: [null],
      isSupplies: [null],
      isQuickCheckoutEligible: [null],
      isSaleable: [true],
      isFavourite: [null],
      inDraftMode: [true],
      additionalCosts: this._fb.array([]),
      productExpense: this._fb.group({
        showExpenses: [true],
        expenseValues: this._fb.array([]),
        expenseConversionTypes: this._fb.array([]),
        cost: this._fb.group({
          attributeValue: [],
          userConversionUom: [null],
        }),
        weight: this._fb.group({
          attributeValue: [],
          userConversionUom: [null],
        }),
        materialCost: this._fb.group({
          attributeValue: [],
          userConversionUom: [null],
        }),
        conversionCost: this._fb.group({
          attributeValue: [],
          userConversionUom: [null],
        }),
      }),
      packages: this._fb.array([]),
      productSummary: this._fb.group({
        totalCost: this._fb.group({
          UNIT: this.createProductSummaryCost(),
          PALLET: this.createProductSummaryCost(),
          SKU: this.createProductSummaryCost(),
          CONTAINER: this.createProductSummaryCost(),
        }),
        sellingPrice: this._fb.group({
          UNIT: this.createProductSummaryCost(),
          PALLET: this.createProductSummaryCost(),
          SKU: this.createProductSummaryCost(),
          CONTAINER: this.createProductSummaryCost(),
        }),
        skusInContainer: [],
        skusInPallet: [],
        considerSkuTotalCost: this._fb.group({
          attributeValue: [],
          userConversionUom: [],
        }),
        considerSkuTotalPrice: this._fb.group({
          attributeValue: [],
          userConversionUom: [],
        }),
        palletTotalCost: this._fb.group({
          attributeValue: [],
          userConversionUom: [],
        }),
        palletTotalPrice: this._fb.group({
          attributeValue: [],
          userConversionUom: [],
        }),
        containerTotalCost: this._fb.group({
          attributeValue: [],
          userConversionUom: [],
        }),
        containerTotalPrice: this._fb.group({
          attributeValue: [],
          userConversionUom: [],
        }),
        unitTotalPrice: this._fb.group({
          attributeValue: [],
          userConversionUom: [],
        }),
        containerTypeId: [],
        unitTotalCost: this._fb.group({
          attributeValue: [],
          userConversionUom: [],
        }),
      }),
      productMeta: this._fb.group({
        id: [],
        audit: [],
        hibernateLazyInitializer: [],
        description: [],
        images: this._fb.array([]),
        isProductOfProcess: [false],
        productCode: [null, Validators.required],
        parentProductMetaId: [],
        metaTitle: [],
        metaDescription: [],
        metaKeyword: [],
        ogTitle: [],
        ogDescription: [],
        twitterTitle: [],
        twitterDescription: [],
      }),
      productInformationValues: this._fb.array([]),
      showProductAttributeValues: [true],
      showAdditionalCosts: [true],
      productAttributeValues: this._fb.array([]),
      isExtraExpense: [false],
      process: [null],
      businessAccountId: [null],
      productTypeId: [null],
      productSubTypeId: [null],
      productTemplateId: [null],
      preferredCustomerId: [null],
      preferredVendorId: [null],
      vendorId: [null],
      isVendorProduct: [false],
      vendorProductBusinessId: [],
      productMetaId: [null],
      keyWords: [[]],
      similarProducts: this._fb.array([]),
      productCompetitors: this._fb.array([]),
    });
  }

  createProductCompetitorForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      platformName: [null],
      productLink: [null],
      price: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      requireLogin: [false],
      hasApiIntegration: [false],
      priceSelector: [null],
      lastFetchedAt: [null],
      sortOrder: [null],
    });
  }

  createSimilarProductForm(): UntypedFormGroup {
    return this._fb.group({
      id: [],
      sortOrder: [],
      productId: [],
      productCode: [],
      productName: [],
      preferredVendorId: [],
      productImage: [null]
    });
  }

  createCustomTierPricingForm(): UntypedFormGroup {
    return this._fb.group({
      marginPercent: [],
      markupPercent: [],
      calculationType: ['MARGIN'],
      tierCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }), 
      skuType: [],
      sortOrder: [],
      minimumQuantity: [],
      maximumQuantity: [],
      deliveryPricing: this._fb.array([])
    });
  }
  createQuickCheckoutTierPricingForm(): UntypedFormGroup {
    return this._fb.group({
      marginPercent: [],
      markupPercent: [],
      calculationType:[],
      tierCost: this._fb.group({
        attributeValue: [],
        userConversionUom: [],
      }),
      skuType: [],
      sortOrder: [],
      minimumQuantity: [],
      maximumQuantity: [],
      deliveryPricing: this._fb.array([]),
    });
  }

  createDeliveryPricingForm(): UntypedFormGroup {
    return this._fb.group({
      numberOfDays: [],
      metricCost: this._fb.group({
        attributeValue: [],
        userConversionUom: [],
      }),
      deliveryCost: this._fb.group({
        attributeValue: [],
        userConversionUom: [],
      }),
      sortOrder: [],
    });
  }



  createAdditionalCostForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      sortOrder: [1],
      costName: [null],
      description: [null],
      attributeValue: [null],
      userConversionUom: [null],
      additionalCostValueType: [null],
      additionalCostValues: this._fb.array([])
    });
  }

  createProductExpenseForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      cost: this._fb.group({
        userConversionUom: [null],
        attributeValue: [
          null,
          [
            Validators.required,
            Validators.pattern(
              '^(0+(.[0-9]+)?|0*[1-9][0-9]*(.[0-9]+)?|0+.[0-9]*[1-9][0-9]*)$'
            ),
          ],
        ],
      }),
      weight: this._fb.group({
        userConversionUom: [null, Validators.required],
        attributeValue: [null, Validators.required],
      }),
      isProduct: [false],
      expenseDescription: [null],
      sortOrder: [1],
      expenseProductId: [null],
      productTypeId: [null],
      expenseProductCode: [null],
      includeExpense: [true],
      isUserInput: [false],
      adjustedCost: this._fb.group({
        userConversionUom: [null],
        attributeValue: [
          null,
          [
            Validators.required,
            Validators.pattern(
              '^(0+(.[0-9]+)?|0*[1-9][0-9]*(.[0-9]+)?|0+.[0-9]*[1-9][0-9]*)$'
            ),
          ],
        ],
      })
    });
  }

  createProductExpenseConversionTypeForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      cost: this._fb.group({
        userConversionUom: ['USD'],
        attributeValue: [
          null,
          [
            Validators.required,
            Validators.pattern(
              '^(0+(.[0-9]+)?|0*[1-9][0-9]*(.[0-9]+)?|0+.[0-9]*[1-9][0-9]*)$'
            ),
          ],
        ],
      }),
      sortOrder: [1],
      conversionTypeId: [null, Validators.required],
    });
  }

  createBuyingCapacityForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      buyingCapacityType: [null],
      decimalValue: [null],
      marginPercent: [null],
      markupPercent: [null],
      skuCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      consideredSkuPrice: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      })
    });
  }

  createImageForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      sortOrder: [1],
      fileName: [null],
      isHide: [false]
    });
  }

  createProductInformationForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      attributeValue: [null],
      description: [null],
      sortOrder: [1],
    });
  }

  createProductSummaryCost() {
    return this._fb.group({
      id: [null],
      considerSkuCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      unitCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      palletCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      truckCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      containerCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      calculatedCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      cost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      metricCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      volumeMetricCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      surfaceAreaMetricCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
      skuCost: this._fb.group({
        attributeValue: [null],
        userConversionUom: [null],
      }),
    });
  }

  createPackageForm() {
    return this._fb.group({
      id: [null],
      considerCost: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      cost: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      costPerSku: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      numberOfSkus: [],
      weight: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      density: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      volume: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      surfaceArea: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      metricCost: this._fb.group({
        userConversionUom: [null],
        attributeValue: [null],
      }),
      packageExpense: this._fb.group({
        id: [null],
        showExpenses: [true],
        expenseValues: this._fb.array([]),
        expenseConversionTypes: this._fb.array([]),
        cost: this._fb.group({
          userConversionUom: [null],
          attributeValue: [null],
        }),
        weight: this._fb.group({
          userConversionUom: [null],
          attributeValue: [null],
        }),
        materialCost: this._fb.group({
          userConversionUom: [null],
          attributeValue: [null],
        }),
        conversionCost: this._fb.group({
          userConversionUom: [null],
          attributeValue: [null],
        }),
      }),
      isSku: [false],
      packageSKUDetail: this._fb.group({
        mqo: [null],
        mqoWeight: this._fb.group({
          userConversionUom: [null],
          attributeValue: [null],
        }),
        mqoCustom: [null],
        mqoCustomWeight: this._fb.group({
          userConversionUom: [null],
          attributeValue: [null],
        }),
        mqs: [null],
        mqsWeight: this._fb.group({
          userConversionUom: [null],
          attributeValue: [null],
        }),
        isStackable: [true]
      }),
      numberOfItems: [],
      sortOrder: [1],
      packageImages: this._fb.array([]),
      palletInformation: this._fb.group({
        skuPerPallet: [],
        palletRows: this._fb.array([]),
      }),
      odometer: this._fb.group({
        value: [null],
        odometerType: [null],
      }),
      showPackageAttributeValues: [true],
      packageAttributeValues: this._fb.array([]),
      packageConversionTypes: this._fb.array([]),
      packageCostSummary: [],
      packageType: [null],
      parentPackageId: [null],
      parentPackageType: [null]
    });
  }

  createPackageExpenseForm() {
    return this._fb.group({
      id: [null],
      expenseDescription: [null, Validators.required],
      sortOrder: [1],
      cost: this._fb.group({
        userConversionUom: [null],
        attributeValue: [
          0,
          Validators.required
        ],
      }),
      weight: this._fb.group({
        userConversionUom: [null, Validators.required],
        attributeValue: [null, Validators.required],
      }),
      isProduct: [false, Validators.required],
      expenseProductId: [null],
      expenseProductCode: [null],
      productTypeId: [null],
    });
  }

  createPalletRowForm() {
    return this._fb.group({
      rx: [null],
      ry: [null],
      rowValue: [null],
      columnValue: [null],
      total: [null],
      rowNumber: [null],
    });
  }

  createPackageExpenseConversionTypeForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      cost: this._fb.group({
        userConversionUom: [null],
        attributeValue: [
          null,
          [
            Validators.required,
            Validators.pattern(
              '^(0+(.[0-9]+)?|0*[1-9][0-9]*(.[0-9]+)?|0+.[0-9]*[1-9][0-9]*)$'
            ),
          ],
        ],
      }),
      sortOrder: [1],
      conversionTypeId: [null, Validators.required],
    });
  }

  createPackageAttributeForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      forInternalCalculation: [],
      attributeValue: [null],
      userConversionUom: [null],
      attributeValueExpression: [null],
      calculationOrder: [null],
      isHidden: [null],
      sortOrder: [1],
      isReadOnly: [null],
      isUserInput: [false],
      colSpace: [100],
      groupName: [null],
      attributeId: [null],
    });
  }


  createAttributeForm(): UntypedFormGroup {
    return this._fb.group({
      forInternalCalculation: [],
      attributeValue: [null],
      userConversionUom: [null],
      attributeValueExpression: [null],
      calculationOrder: [null],
      isHidden: [null],
      sortOrder: [1],
      isReadOnly: [false],
      isUserInput: [false],
      colSpace: [100],
      groupName: [null],
      attributeId: [null]
    });
  }

  createPackageCalculatorTemplates() {
    return this._fb.group({
      id: [null],
      metaCalculatorId: [null],
      description: [null],
      packageCalculatorTemplateAttributeValues: this._fb.array([]),
      packageType: [null],
      sortOrder: [1],
      attributeName: [],
      attributeType: [],
      isSku: [false],
      colSpace: [25]
    });
  }

  createPreferUomForm() {
    return this._fb.group({
      id: [null],
      componentType: [],
      componentUoms: this._fb.array([]),
    });
  }

  createComponentUomForm() {
    return this._fb.group({
      attributeName: [null],
      attributeTypeId: [],
      id: [null],
      sortOrder: [null],
      userConversionUom: [null],
      columnMappings: []
    });
  }





}
