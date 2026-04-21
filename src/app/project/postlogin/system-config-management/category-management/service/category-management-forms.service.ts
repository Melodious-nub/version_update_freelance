import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class CategoryManagementFormsService {
  constructor(public _fb: UntypedFormBuilder) { }



  createCategoryForm(): UntypedFormGroup {
    return this._fb.group({
      id: [],
      productSubTypeIds:[null],
      description: [null],
      categoryIndustryTypes: [null],
      categoryProductTypes:[null],
      buyingCapacityType: [null]
    })
  }
}