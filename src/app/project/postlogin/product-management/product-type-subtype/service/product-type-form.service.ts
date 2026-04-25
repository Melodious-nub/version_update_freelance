import { Injectable, inject } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ProductTypeFormService {
  _fb = inject(UntypedFormBuilder);


  createProductTypeForm(): UntypedFormGroup {
    return this._fb.group({
      isExport:[null],
      id: [null],  
      audit:[null],  
      additionalCosts: this._fb.array([]),
      productSubTypes: [null],  
      buyingCapacities: this._fb.array([]),
      debugInformation:[null],  
      description:[null],  
      divisionPercent:[null],  
      expensePercent:[null],  
      exportDescription:[null],  
      hsnIndiaTypeId:[null],  
      hsnUsaTypeId:[null],  
      productCategoryIds:[null],  
      productTemplateId:[null],  
    });
  }

  createProductSubTypeForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],  
      audit:[null],  
      additionalCosts: this._fb.array([]), 
      buyingCapacities: this._fb.array([]),
      debugInformation:[null],  
      description:[null],  
      divisionPercent:[null],  
      expensePercent:[null],  
      exportDescription:[null],  
      hsnIndiaTypeId:[null],  
      hsnUsaTypeId:[null],  
      productCategoryIds:[null],  
      productTemplateId:[null],  
      productTypeId:[null],
      isOverridden:[true]
    });
  }

  createBuyingCapacityForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],  
      audit:[null],      
      buyingCapacityType:[null],  
      debugInformation:[null],  
      decimalValue:[null],  
      marginPercent:[null],  
      markupPercent:[null]
    });
  }

  createAdditionalCostForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],  
      audit:[null],      
      additionalCostValues:this._fb.array([]),
      debugInformation:[null],  
      description:[null],  
      isFavourite:[null],  
      sortOrder:[null]
    });
  }

  createAdditionalCostValueForm(): UntypedFormGroup {
    return this._fb.group({
      additionalCostValueType: [null],  
      attributeValue:[null],      
      description:[null],  
      debugInformation:[null],  
      id:[null],  
      sortOrder:[null],
      userConversionUom:[null]
    });
  }

}
