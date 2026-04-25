import { Injectable, inject } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UserFormsService {
  _fb = inject(UntypedFormBuilder);


  createUserForm(): UntypedFormGroup {
    return this._fb.group({
      roleName:[]
    });
  }
}