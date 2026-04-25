import { Injectable, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class CategoryManagementFormsService {
  _fb = inject(UntypedFormBuilder);




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