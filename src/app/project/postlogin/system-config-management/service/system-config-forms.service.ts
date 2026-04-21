import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class SystemConfigFormsService {
  constructor(public _fb: UntypedFormBuilder) { }

  createBusinessEntityConfigurationForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      audit: this._fb.group({
        createdDate: [null],
        createdById: [null],
        createdByName: [null],
        createdByUserName: [null],
        lastModifiedDate: [null],
        lastModifiedById: [null],
        lastModifiedByName: [null],
        lastModifiedByUserName: [null],
        businessAccountId: [null]
      }),
      configurationType: [null, Validators.required],
      name: [null, Validators.required],
      isActive: [true],
      isDefault: [false],
      sections: this._fb.array([]),
      configurerBusinessAccountId: [null]
    });
  }

  createSectionForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      sectionName: [null, Validators.required],
      sectionCode: [null, Validators.required],
      sortOrder: [1],
      isCollapsible: [false],
      isCollapsedByDefault: [false],
      attributes: this._fb.array([]),
      attributeName: [],
      attributeType: [],
      colSpace: [25]
    });
  }

  createAttributeConfigForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      attributeValueExpression: [null],
      attributeValue: [null],
      attributeIdValue: [null],
      attributeName: [null],
      attributeTypeIdValue: [null],
      colSpace: [25],
      enabledForListView: [true],
      isHidden: [false],
      isReadOnly: [false],
      isRequired: [false],
      sortOrder: [1],
      defaultValue: [null],
      userConversionUom: [null],
      attributeId: [null, Validators.required],
      attributeTypeId: [null]
    });
  }

}
