import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { SortFormArrayPipe } from '../../../../../shared/pipes/sort-formarray-sortorder.pipe';
import { MatIcon } from '@angular/material/icon';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';
@Component({
    selector: 'app-calculate-error-modal',
    templateUrl: './calculate-error-modal.component.html',
    styleUrls: ['./calculate-error-modal.component.scss'],
    imports: [MatDialogClose, FormsModule, ReactiveFormsModule, NgClass, ExtendedModule, MatIcon, SortFormArrayPipe]
})
export class CalculateErrorModalComponent implements OnInit {
  productForm = this.formsService.createProductForm()
  labelTypeAttributeIds: any[] = []
  errorKeys: any
  errors: any
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public apiService: ApiService, public toastr: ToastrService, public fb: UntypedFormBuilder, public formsService: FormsService, public dialogRef: MatDialogRef<CalculateErrorModalComponent>) {

  }

  ngOnInit(): void {
    this.labelTypeAttributeIds = this.data.labelTypeAttributeIds
    if (this.data?.errors) {
      this.errorKeys = Object.keys(this.data?.errors)
      this.errors = this.data.errors
    }
    this.patchEditData()
  }


  getArrayIds(str: String) {
    let prop = JSON.parse(str.replace(/'/g, '"'));
    let propids: any = [];
    prop.forEach((element) => {
      propids.push(Number(element.attributeId));
    });
    return propids;
  }

  getPackageAttributeValues(i) {
    return this.packages.controls[i].get('packageAttributeValues') as UntypedFormArray;
  }

  get productAttributeValues() {
    return this.productForm.get('productAttributeValues') as UntypedFormArray
  }

  get packages() {
    return this.productForm.get('packages') as UntypedFormArray
  }
  getArray(str: String) {
    if (!str) {
      return []
    }
    let prop = JSON.parse(str.replace(/'/g, '"'));
    return prop;
  }

  filterAttributeForLabelPackage(attributes: UntypedFormArray, i: any) {
    return attributes.controls
      .filter((control) => {
        return this.labelTypeAttributeIds[i].includes(
          control.get('attributeId').value
        );
      })
      .sort(
        (a, b) =>
          this.labelTypeAttributeIds[i].indexOf(a.get('attributeId').value) -
          this.labelTypeAttributeIds[i].indexOf(b.get('attributeId').value)
      );
  }
  filterAttributeForLabel(attributes: UntypedFormArray) {
    return attributes.controls
      .filter((control) => {
        return this.labelTypeAttributeIds.includes(
          control.get('attributeId').value
        );
      })
      .sort(
        (a, b) =>
          this.labelTypeAttributeIds.indexOf(a.get('attributeId').value) -
          this.labelTypeAttributeIds.indexOf(b.get('attributeId').value)
      );
  }


  getDescription(item: any) {
    return this.getAttributeObjectById(item?.get("attributeId").value)?.description
  }


  patchEditData() {
    if (this.data.type == 'ProductCalculator') {
      this.productAttributeValues.clear();
      this.data?.productTemplateCalculator?.productTemplateCalculator.productCalculatorTemplateAttributeValues?.forEach((element) => {
        const Form = this.formsService.createAttributeForm()
        Form.patchValue(element)
        this.productAttributeValues.push(Form);
      });
      this.calculateValues()
    }
    if (this.data.type == 'PackageCalculator') {
      this.packages.clear();
      // this.data?.productTemplateCalculator?.productTemplateCalculator?.packageCalculatorTemplates?.forEach((pck, index) => {
      //   let form = this.formsService.createPackageForm();
      //   form.patchValue(pck)
      //   let packageAttributeValues = form.get(
      //     'packageAttributeValues'
      //   ) as FormArray;

      //   pck?.packageCalculatorTemplateAttributeValues?.forEach((el, n) => {
      //     const attributeForm = this.formsService.createAttributeForm()
      //     attributeForm.patchValue(el)
      //     packageAttributeValues.push(
      //       attributeForm
      //     );
      //   });

      //   this.packages.push(form);
      // });

      let form = this.formsService.createPackageForm();
      form.patchValue(this.data?.productTemplateCalculator?.productTemplateCalculator?.packageCalculatorTemplates[this.data?.index])
      let packageAttributeValues = form.get(
        'packageAttributeValues'
      ) as UntypedFormArray;

      this.data?.productTemplateCalculator?.productTemplateCalculator?.packageCalculatorTemplates[this.data?.index]?.packageCalculatorTemplateAttributeValues?.forEach((el, n) => {
        const attributeForm = this.formsService.createAttributeForm()
        attributeForm.patchValue(el)
        packageAttributeValues.push(
          attributeForm
        );
      });

      this.packages.push(form);
      this.calculateValues()
    }
  }

  async calculateValues() {
    try {
      let data: any = this.productForm.getRawValue();
      data.productTemplateForCalculation = this.data.productTemplateCalculator
      const res: any = await this.apiService.calculateProductValues(data);
      this.productForm.patchValue(res)
      this.errorKeys = Object.keys(this.debugInformation.value?.CALCULATOR_EXPRESSION?.nativeCache)
      this.errors = this.debugInformation.value?.CALCULATOR_EXPRESSION?.nativeCache
    } catch (err: any) {

      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }
  changeValue(item?: UntypedFormGroup) {
    if (item) {
      item.get('isUserInput').setValue(true);
    }
    this.calculateValues();
  }
  get debugInformation() {
    return this.productForm.get('debugInformation')
  }


  toggleVisibility(item: any, param: any) {
    item.get('isHidden').setValue(param);
    this.calculateValues();
  }

  async toggleAttribute(item: UntypedFormGroup, index) {
    let it = item?.get('attributeValueExpression');
    let expressionArray = await this.getArray(
      item.get('attributeValueExpression').value
    );
    expressionArray[index].selected = true;
    if (index == 1) {
      expressionArray[0].selected = false;
    }
    if (index == 0) {
      expressionArray[1].selected = false;
    }
    let expression = JSON.stringify(expressionArray);

    it.setValue(expression);
    this.calculateValues();
  }

  toggleLock(item: any, param: any) {
    item.get('isUserInput').setValue(param);
    this.calculateValues();
  }

  save() {
    this.dialogRef.close(null);
  }


  getAttributeObjectById(attributeId: any) {
    if (attributeId) {
      let selectedAttribute = this.apiService.allAttributes.find(
        (x) => x['id'] == attributeId
      );
      return selectedAttribute;
    } else {
      return;
    }
  }

  getAttributeTypeObjectById(attributeTypeId: any) {
    if (attributeTypeId) {
      let selectedAttribute = this.apiService.allAttributesTypes.find(
        (x) => x['id'] == attributeTypeId
      );
      return selectedAttribute;
    } else {
      return;
    }
  }
}
