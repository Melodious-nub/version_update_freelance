import { Injectable } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UserFormsService {
  constructor(public _fb: UntypedFormBuilder) { }

  createUserForm(): UntypedFormGroup {
    return this._fb.group({
      roleName:[]
    });
  }
}