import { Injectable, inject } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementFormsService {
  _fb = inject(UntypedFormBuilder);


 
  noteForm(): UntypedFormGroup {
    return this._fb.group({
      id:[null],
      note_title: [null],
      description: [null],
      transaction_categories: [null],
    });
  }
  createAttributeConfigForm(): UntypedFormGroup {
    return  this._fb.group({
      id:[],
      attributes: [null],
      description: [null],
      transactionCategory: [null],
      priceOptions: [null],
      productOptions:[null],
      productTypeId: [null],
      infoOptions: this._fb.group({
        METRICCOST: [null],
        VOLUME: [null],
        WEIGHT: [null]
      })
    })
  }

 
}